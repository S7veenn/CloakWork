// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config();

import {
  CreateTaskRequest,
  ApplyToTaskRequest,
  SubmitProofRequest,
  CreateMatchRequest,
  GetTasksQuery,
  ApiResponse,
  CreateTaskResponse,
  GetTasksResponse,
  ApplyToTaskResponse,
  SubmitProofResponse,
  CreateMatchResponse,
  Task,
  Application,
  Proof,
  Match,
  ErrorCodes,
  ApiError
} from './types';

import {
  handleContractOperation,
  contractErrorToApiError,
  validateContractInitialization,
  logContractMetrics,
  contractErrorMiddleware,
  ContractError,
  ContractErrorType
} from './utils/errorHandler';

import {
  configureTaskProviders,
  configureProofProviders,
  configureMatchingProviders,
  joinTaskContract,
  joinProofContract,
  joinMatchingContract,
  deployTaskContract,
  deployProofContract,
  deployMatchingContract,
  buildFreshWallet,
  buildWalletAndWaitForFunds,
  buildWalletFromExistingSeed,
  randomBytes,
  type BaseProviders,
  type TaskPrivateState,
  type ProofPrivateState,
  type MatchingPrivateState
} from './api';

import { type Config, TestnetRemoteConfig } from './config';

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, 'Incoming request');
  next();
});

// Contract error handling middleware
app.use(contractErrorMiddleware());

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, req: req.url }, 'Unhandled error');
  
  // Try to convert to API error if it's a contract-related error
  let apiError: ApiError;
  if (err instanceof ContractError || err.message.includes('contract')) {
    apiError = contractErrorToApiError(err, req.route?.path || req.url);
  } else {
    apiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? [err.message] : undefined,
      statusCode: 500
    };
  }
  
  const response: ApiResponse = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(apiError.statusCode || 500).json(response);
});

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  requirements: Joi.array().items(Joi.string()).min(1).max(10).required(),
  reward: Joi.number().min(0).required(),
  deadline: Joi.date().iso().required(),
  ownerId: Joi.string().required()
});

const applyToTaskSchema = Joi.object({
  contributorId: Joi.string().required(),
  proposal: Joi.string().max(1000).required(),
  estimatedHours: Joi.number().min(1).required()
});

const submitProofSchema = Joi.object({
  taskId: Joi.string().required(),
  contributorId: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  zkProof: Joi.string().required()
});

const createMatchSchema = Joi.object({
  taskId: Joi.string().required(),
  applicationId: Joi.string().required(),
  ownerId: Joi.string().required(),
  contributorId: Joi.string().required(),
  contributorConsent: Joi.boolean().optional()
});

// Contract instances and providers (initialized on startup)
let taskContract: any = null;
let proofContract: any = null;
let matchingContract: any = null;
let taskProviders: BaseProviders | null = null;
let proofProviders: BaseProviders | null = null;
let matchingProviders: BaseProviders | null = null;
let wallet: any = null;

// Track whether server is running in mock mode
let mockMode: boolean = false;

// Configuration for contract deployment and blockchain connection
const config: Config = process.env.NODE_ENV === 'production' || process.env.USE_TESTNET === 'true' 
  ? new TestnetRemoteConfig()
  : {
      indexer: process.env.INDEXER_URL || 'http://localhost:32778/api/v1/graphql',
      indexerWS: process.env.INDEXER_WS_URL || 'ws://localhost:32778/api/v1/graphql/ws',
      node: process.env.NODE_URL || process.env.NETWORK_URL || 'http://localhost:60721',
      proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300'
    };

// Environment-based contract configuration
const contractAddresses = {
  taskContract: process.env.TASK_CONTRACT_ADDRESS,
  proofContract: process.env.PROOF_CONTRACT_ADDRESS,
  matchingContract: process.env.MATCH_CONTRACT_ADDRESS
};

// Blockchain configuration
const blockchainConfig = {
  networkUrl: process.env.NETWORK_URL || 'http://localhost:8545',
  chainId: parseInt(process.env.CHAIN_ID || '1337'),
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY,
  serverPrivateKey: process.env.SERVER_PRIVATE_KEY,
  contractTimeout: parseInt(process.env.CONTRACT_TIMEOUT_MS || '30000'),
  maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
  retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000')
};

// In-memory storage (temporary until full blockchain migration)
const tasks: Map<string, Task> = new Map();
const applications: Map<string, Application> = new Map();
const proofs: Map<string, Proof> = new Map();
const matches: Map<string, Match> = new Map();

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

function createErrorResponse(error: ApiError): ApiResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    timestamp: new Date().toISOString()
  };
}

// Validation middleware
function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const apiError: ApiError = {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        details: error.details.map(d => d.message),
        statusCode: 400
      };
      return res.status(400).json(createErrorResponse(apiError));
    }
    next();
  };
}

// ==================
// API ENDPOINTS
// ==================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json(createSuccessResponse({ status: 'healthy', timestamp: new Date().toISOString() }));
});

// API Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Auth endpoints
app.post('/api/auth/wallet', async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      const apiError: ApiError = {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Wallet address, signature, and message are required',
        statusCode: 400
      };
      return res.status(400).json(createErrorResponse(apiError));
    }

    // Mock wallet authentication logic
    const userId = `user_${Date.now()}`;
    
    const authResponse = {
      success: true,
      userId,
      walletAddress,
      timestamp: new Date().toISOString()
    };

    logger.info({ walletAddress, userId }, 'Wallet authenticated');
    res.json(authResponse);
  } catch (error) {
    logger.error({ error }, 'Error authenticating wallet');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// POST /tasks - Create and store a new task using real contract
app.post('/api/tasks', validateRequest(createTaskSchema), async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const taskData = req.body;
    
    // Validate deadline is not in the past
    const deadlineDate = new Date(taskData.deadline);
    const now = new Date();
    if (deadlineDate <= now) {
      const apiError: ApiError = {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Deadline cannot be in the past',
        statusCode: 400
      };
      return res.status(400).json(createErrorResponse(apiError));
    }
    
    // Skip contract validation in test mode
    if (process.env.NODE_ENV !== 'test') {
      // Validate contract initialization
      validateContractInitialization([
        { name: 'taskContract', instance: taskContract },
        { name: 'taskProviders', instance: taskProviders }
      ]);
    }
    
    if (mockMode) {
      // Mock mode: create mock task and store in memory
      const taskId = generateId();
      const task = {
        id: taskId,
        title: taskData.title,
        description: taskData.description,
        requirements: taskData.requirements,
        reward: taskData.reward,
        deadline: taskData.deadline,
        ownerId: taskData.ownerId,
        status: 'open' as const,
        timestamp: new Date().toISOString()
      };
      
      tasks.set(taskId, task as any);
      logger.info({ taskId }, 'Mock task created successfully in mock mode');
      res.status(201).json(task);
    } else {
      logger.info({ taskData }, 'Creating new task on blockchain');
      
      // Create task on blockchain using enhanced error handling
      const result = await handleContractOperation(
        async () => {
          const createTaskResult = await taskContract.callTx.createTask({
            title: taskData.title,
            description: taskData.description,
            requirements: taskData.requirements,
            reward: BigInt(taskData.reward),
            deadline: BigInt(Math.floor(deadlineDate.getTime() / 1000)),
            ownerId: taskData.ownerId
          });
          
          const txResult = await createTaskResult.submit();
          return { txResult, taskId: txResult.events?.taskCreated?.taskId || generateId() };
        },
        'createTask',
        'TaskContract'
      );
      
      const task = {
        id: result.taskId,
        title: taskData.title,
        description: taskData.description,
        requirements: taskData.requirements,
        reward: taskData.reward,
        deadline: taskData.deadline,
        ownerId: taskData.ownerId,
        status: 'open' as const,
        timestamp: new Date().toISOString(),
        transactionId: result.txResult.transactionId
      };
      
      logContractMetrics('createTask', 'TaskContract', startTime, true, result.txResult.transactionId);
      logger.info({ taskId: result.taskId, transactionId: result.txResult.transactionId }, 'Task created successfully on blockchain');
      res.status(201).json(task);
    }
    
  } catch (error) {
    logContractMetrics('createTask', 'TaskContract', startTime, false);
    const apiError = contractErrorToApiError(error as Error, 'createTask');
    res.status(apiError.statusCode).json(createErrorResponse(apiError));
  }
});

// GET /tasks - Retrieve and filter tasks from blockchain
app.get('/api/tasks', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { status, owner, search, page, limit } = req.query;
    
    if (mockMode) {
      // Validate pagination parameters
      const pageNum = Number(page);
      const limitNum = Number(limit);
      
      if ((page !== undefined && (isNaN(pageNum) || pageNum < 1)) || 
          (limit !== undefined && (isNaN(limitNum) || limitNum < 1))) {
        const apiError: ApiError = {
           code: ErrorCodes.VALIDATION_ERROR,
           message: 'Invalid pagination parameters',
           statusCode: 400
         };
        return res.status(400).json(createErrorResponse(apiError));
      }
      
      // Mock mode: get tasks from in-memory storage
      let filteredTasks = Array.from(tasks.values());
      
      // Filter by status
      if (status && typeof status === 'string') {
        filteredTasks = filteredTasks.filter((task: any) => task.status === status);
      }
      
      // Filter by owner
      if (owner && typeof owner === 'string') {
        filteredTasks = filteredTasks.filter((task: any) => task.ownerId === owner);
      }
      
      // Search in title and description
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filteredTasks = filteredTasks.filter((task: any) => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by timestamp (newest first)
      filteredTasks.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Apply pagination
      const finalLimit = limitNum || 20;
      const offset = pageNum ? (pageNum - 1) * finalLimit : 0;
      const paginatedTasks = filteredTasks.slice(offset, offset + finalLimit);
      
      logger.info({ count: paginatedTasks.length, total: filteredTasks.length }, 'Retrieved tasks from memory in mock mode');
      res.json(paginatedTasks);
    } else {
      // Validate contract initialization
      validateContractInitialization([
        { name: 'taskContract', instance: taskContract },
        { name: 'taskProviders', instance: taskProviders }
      ]);
      
      logger.info({ filters: { status, owner, search } }, 'Retrieving tasks from blockchain');
      
      // Get all tasks from blockchain using enhanced error handling
      const allTasksResult = await handleContractOperation(
        async () => {
          return await taskContract.callTx.getAllActiveTasks();
        },
        'getAllActiveTasks',
        'TaskContract'
      );
      
      let filteredTasks = allTasksResult.tasks || [];
      
      // Convert blockchain data to API format
      filteredTasks = filteredTasks.map((task: any) => ({
        id: task.taskId,
        title: task.title,
        description: task.description,
        requirements: task.requirements,
        reward: Number(task.reward),
        deadline: new Date(Number(task.deadline) * 1000).toISOString(),
        ownerId: task.ownerId,
        status: task.status,
        timestamp: new Date(Number(task.createdAt) * 1000).toISOString()
      }));
      
      // Filter by status
      if (status && typeof status === 'string') {
        filteredTasks = filteredTasks.filter((task: any) => task.status === status);
      }
      
      // Filter by owner
      if (owner && typeof owner === 'string') {
        filteredTasks = filteredTasks.filter((task: any) => task.ownerId === owner);
      }
      
      // Search in title and description
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filteredTasks = filteredTasks.filter((task: any) => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by timestamp (newest first)
      filteredTasks.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      logContractMetrics('getAllActiveTasks', 'TaskContract', startTime, true);
      logger.info({ count: filteredTasks.length }, 'Retrieved tasks from blockchain');
      res.json(filteredTasks);
    }
    
  } catch (error) {
    logContractMetrics('getAllActiveTasks', 'TaskContract', startTime, false);
    const apiError = contractErrorToApiError(error as Error, 'getAllActiveTasks');
    res.status(apiError.statusCode).json(createErrorResponse(apiError));
  }
});

// POST /tasks/:id/apply - Handle task applications
app.post('/api/tasks/:id/apply', validateRequest(applyToTaskSchema), async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const applicationData = req.body;
    const applicationId = generateId();
    
    logger.info({ taskId, applicationId }, 'Processing task application');
    
    // Skip contract validation in test mode
    if (process.env.NODE_ENV !== 'test') {
      // Validate contract initialization
      validateContractInitialization([
        { name: 'taskContract', instance: taskContract }
      ]);
    }
    
    // Check if task exists
    const task = tasks.get(taskId);
    if (!task) {
      const apiError: ApiError = {
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        message: 'Task not found',
        statusCode: 404
      };
      return res.status(404).json(createErrorResponse(apiError));
    }
    
    // Create application
    const application = {
      id: applicationId,
      taskId: taskId,
      contributorId: applicationData.contributorId,
      proposal: applicationData.proposal,
      estimatedHours: applicationData.estimatedHours,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    applications.set(applicationId, application as any);
    
    logger.info({ applicationId }, 'Application submitted successfully');
    res.status(201).json(application);
    
  } catch (error) {
    logger.error({ error }, 'Error processing application');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to process application',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// GET /proofs - Retrieve proofs from blockchain
app.get('/api/proofs', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { taskId, contributorId, verified } = req.query;
    
    if (mockMode) {
      // Mock mode: get proofs from in-memory storage
      let proofsList = Array.from(proofs.values());
      
      // Apply filters
      if (taskId && typeof taskId === 'string') {
        proofsList = proofsList.filter((proof: any) => proof.taskId === taskId);
      }
      
      if (contributorId && typeof contributorId === 'string') {
        proofsList = proofsList.filter((proof: any) => proof.contributorId === contributorId);
      }
      
      if (verified !== undefined) {
        const isVerified = verified === 'true';
        proofsList = proofsList.filter((proof: any) => proof.verified === isVerified);
      }
      
      // Sort by timestamp (newest first)
      proofsList.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      logger.info({ count: proofsList.length }, 'Retrieved proofs from memory in mock mode');
      res.json(proofsList);
    } else {
      // Validate contract initialization
      validateContractInitialization([
        { name: 'proofContract', instance: proofContract },
        { name: 'proofProviders', instance: proofProviders }
      ]);
      
      logger.info({ filters: { taskId, contributorId, verified } }, 'Retrieving proofs from blockchain');
      
      // Get proofs from blockchain based on filters using enhanced error handling
      const proofsResult = await handleContractOperation(
        async () => {
          if (taskId && typeof taskId === 'string') {
            return await proofContract.callTx.getTaskProofs({ taskId });
          } else {
            return await proofContract.callTx.getAllProofs();
          }
        },
        'getProofs',
        'ProofContract'
      );
      
      let proofsList = proofsResult.proofs || [];
      
      // Convert blockchain data to API format
      proofsList = proofsList.map((proof: any) => ({
        id: proof.proofId,
        taskId: proof.taskId,
        contributorId: proof.contributorId,
        type: proof.proofType,
        description: proof.description,
        zkProof: proof.zkProofData,
        verified: proof.verified,
        timestamp: new Date(Number(proof.submittedAt) * 1000).toISOString(),
        transactionId: proof.transactionId,
        blockchainProofHash: proof.proofHash
      }));
      
      // Apply filters
      if (contributorId && typeof contributorId === 'string') {
        proofsList = proofsList.filter((proof: any) => proof.contributorId === contributorId);
      }
      
      if (verified !== undefined) {
        const isVerified = verified === 'true';
        proofsList = proofsList.filter((proof: any) => proof.verified === isVerified);
      }
      
      // Sort by timestamp (newest first)
      proofsList.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      logContractMetrics('getProofs', 'ProofContract', startTime, true);
      logger.info({ count: proofsList.length }, 'Retrieved proofs from blockchain');
      res.json(proofsList);
    }
    
  } catch (error) {
    logContractMetrics('getProofs', 'ProofContract', startTime, false);
    const apiError = contractErrorToApiError(error as Error, 'getProofs');
    res.status(apiError.statusCode).json(createErrorResponse(apiError));
  }
});

// POST /proofs - Handle proof submissions using real ZK proof verification
app.post('/api/proofs', validateRequest(submitProofSchema), async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const proofData = req.body;
    const proofId = generateId();
    
    logger.info({ taskId: proofData.taskId }, 'Processing proof submission');
    
    // Skip contract operations in test mode
    if (process.env.NODE_ENV !== 'test') {
      // Validate contract initialization
      validateContractInitialization([
        { name: 'proofContract', instance: proofContract },
        { name: 'proofProviders', instance: proofProviders },
        { name: 'taskContract', instance: taskContract }
      ]);
      
      logger.info({ taskId: proofData.taskId }, 'Processing proof submission on blockchain');
      // Submit and verify proof using enhanced error handling
      const result = await handleContractOperation(
        async () => {
          // Check if task exists on blockchain
          const taskResult = await taskContract.callTx.getTask({ taskId: proofData.taskId });
          if (!taskResult.task) {
            throw new ContractError(
              ContractErrorType.INVALID_PARAMETERS,
              'Task not found on blockchain'
            );
          }
        
        // Submit proof to blockchain
        const submitProofResult = await proofContract.callTx.submitProof({
          taskId: proofData.taskId,
          contributorId: proofData.contributorId,
          proofType: proofData.type || 'completion',
          description: proofData.description,
          zkProofData: proofData.zkProof,
          metadata: {
            submissionTime: Date.now(),
            proofVersion: '1.0'
          }
        });
        
        const txResult = await submitProofResult.submit();
        const proofId = txResult.events?.proofSubmitted?.proofId || generateId();
        
        // Verify the ZK proof
        const verificationResult = await proofContract.callTx.verifyProof({
          proofId: proofId,
          zkProofData: proofData.zkProof
        });
        
        return {
          txResult,
          proofId,
          verified: verificationResult.isValid,
          proofHash: txResult.events?.proofSubmitted?.proofHash
        };
      },
      'submitProof',
      'ProofContract'
    );
    
    const proof = {
      id: result.proofId,
      taskId: proofData.taskId,
      contributorId: proofData.contributorId,
      type: proofData.type,
      description: proofData.description,
      zkProof: proofData.zkProof,
      verified: result.verified,
      timestamp: new Date().toISOString(),
      transactionId: result.txResult.transactionId,
      blockchainProofHash: result.proofHash
    };
    
    logContractMetrics('submitProof', 'ProofContract', startTime, true, result.txResult.transactionId);
    logger.info({ proofId: result.proofId, verified: result.verified, transactionId: result.txResult.transactionId }, 'Proof submitted and verified on blockchain');
    res.status(201).json(proof);
    
    } else {
      // Test mode - validate task exists before creating proof
      const task = tasks.get(proofData.taskId);
      if (!task) {
        const apiError: ApiError = {
          code: ErrorCodes.RESOURCE_NOT_FOUND,
          message: 'Task not found',
          statusCode: 404
        };
        return res.status(404).json(createErrorResponse(apiError));
      }
      
      // Create mock proof
      const proof = {
        id: proofId,
        taskId: proofData.taskId,
        contributorId: proofData.contributorId,
        type: proofData.type,
        description: proofData.description,
        zkProof: proofData.zkProof,
        verified: true,
        timestamp: new Date().toISOString(),
        transactionId: 'mock-tx-' + proofId,
        blockchainProofHash: 'mock-hash-' + proofId
      };
      
      proofs.set(proofId, proof as any);
      logger.info({ proofId }, 'Mock proof created for testing');
      res.status(201).json(proof);
    }
    
  } catch (error) {
    logContractMetrics('submitProof', 'ProofContract', startTime, false);
    const apiError = contractErrorToApiError(error as Error, 'submitProof');
    res.status(apiError.statusCode).json(createErrorResponse(apiError));
  }
});

// GET /matches - Retrieve list of matches
app.get('/api/matches', (req: Request, res: Response) => {
  try {
    const matchesList = Array.from(matches.values());
    logger.info({ count: matchesList.length }, 'Retrieved matches');
    res.json(matchesList);
  } catch (error) {
    logger.error({ error }, 'Error retrieving matches');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to retrieve matches',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// POST /matches - Execute matching algorithm between task owners and contributors
app.post('/api/matches', validateRequest(createMatchSchema), async (req: Request, res: Response) => {
  try {
    const matchData = req.body;
    const matchId = generateId();
    
    logger.info({ matchId, taskId: matchData.taskId }, 'Creating match');
    
    // Check if task exists
    const task = tasks.get(matchData.taskId);
    if (!task) {
      const apiError: ApiError = {
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        message: 'Task not found',
        statusCode: 404
      };
      return res.status(404).json(createErrorResponse(apiError));
    }
    
    // Check if application exists
    const application = applications.get(matchData.applicationId);
    if (!application) {
      const apiError: ApiError = {
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        message: 'Application not found',
        statusCode: 404
      };
      return res.status(404).json(createErrorResponse(apiError));
    }
    
    const status = matchData.contributorConsent ? 'mutual_consent' : 'pending';
    
    const match = {
      id: matchId,
      taskId: matchData.taskId,
      contributorId: matchData.contributorId,
      ownerId: matchData.ownerId,
      status: status,
      contributorRevealed: false,
      ownerRevealed: false,
      timestamp: new Date().toISOString()
    };
    
    matches.set(matchId, match as any);
    
    // Update task status if match is successful
    if (status === 'mutual_consent') {
      task.status = 'in_progress';
      tasks.set(task.id, task);
    }
    
    logger.info({ matchId, status }, 'Match created successfully');
    res.status(201).json(match);
    
  } catch (error) {
    logger.error({ error }, 'Error creating match');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create match',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  const apiError: ApiError = {
    code: ErrorCodes.RESOURCE_NOT_FOUND,
    message: 'Endpoint not found',
    statusCode: 404
  };
  res.status(404).json(createErrorResponse(apiError));
});

// Export function to create server (for testing)
export function createServer() {
  return app;
}

// Export function to reset storage (for testing)
export function resetStorage() {
  tasks.clear();
  applications.clear();
  proofs.clear();
  matches.clear();
}

// Initialize contracts
async function initializeContracts() {
  try {
    logger.info('Initializing blockchain contracts...');
    logger.info({ config }, 'Using configuration');
    
    // Build wallet
    logger.info('Building wallet...');
    const walletSeed = process.env.WALLET_SEED;
    if (walletSeed && walletSeed !== 'your-wallet-seed-here') {
      logger.info('Using existing wallet seed from environment');
      wallet = await buildWalletFromExistingSeed(config, walletSeed, '');
    } else {
      logger.info('Creating fresh wallet with random seed');
      wallet = await buildFreshWallet(config);
    }
    logger.info('Wallet initialized successfully');
    
    // Configure providers
    logger.info('Configuring providers...');
    taskProviders = await configureTaskProviders(wallet, config);
    logger.info('Task providers configured');
    
    proofProviders = await configureProofProviders(wallet, config);
    logger.info('Proof providers configured');
    
    matchingProviders = await configureMatchingProviders(wallet, config);
    logger.info('Matching providers configured');
    
    // Join contracts using addresses from environment
    if (contractAddresses.taskContract) {
      logger.info({ address: contractAddresses.taskContract }, 'Joining task contract...');
      taskContract = await joinTaskContract(taskProviders, contractAddresses.taskContract);
      logger.info('Task contract joined successfully');
    }
    
    if (contractAddresses.proofContract) {
      logger.info({ address: contractAddresses.proofContract }, 'Joining proof contract...');
      proofContract = await joinProofContract(proofProviders, contractAddresses.proofContract);
      logger.info('Proof contract joined successfully');
    }
    
    if (contractAddresses.matchingContract) {
      logger.info({ address: contractAddresses.matchingContract }, 'Joining matching contract...');
      matchingContract = await joinMatchingContract(matchingProviders, contractAddresses.matchingContract);
      logger.info('Matching contract joined successfully');
    }
    
    logger.info('All contracts initialized successfully');
    return true;
  } catch (error) {
    logger.error({ 
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error 
    }, 'Failed to initialize contracts');
    console.error('Contract initialization error:', error);
    return false;
  }
}

// Initialize contracts and start server
async function initializeServer() {
  try {
    logger.info('Initializing CloakWork API server...');
    
    // Check if we should run in mock mode or with real contracts
    const isTestMode = process.env.NODE_ENV === 'test';
    
    if (isTestMode) {
      mockMode = true;
      logger.info('Starting server in mock mode (test environment)');
    } else {
      // Validate that contract addresses are available
      if (!contractAddresses.taskContract || !contractAddresses.proofContract || !contractAddresses.matchingContract) {
        mockMode = true;
        logger.warn('Contract addresses not found in environment variables. Starting in mock mode.');
        logger.info('Starting server in mock mode (contracts disabled)');
      } else {
        logger.info('Contract addresses found. Initializing contracts...');
        const contractsInitialized = await initializeContracts();
        if (!contractsInitialized) {
          mockMode = true;
          logger.warn('Contract initialization failed. Starting in mock mode.');
        } else {
          mockMode = false;
        }
      }
    }
    
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'CloakWork API server started successfully');
      console.log(`🚀 CloakWork API server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      
      if (isTestMode || !contractAddresses.taskContract || !contractAddresses.proofContract || !contractAddresses.matchingContract) {
        console.log(`⚠️  Running in mock mode - contracts disabled`);
      } else {
        console.log(`✅ Contract integration enabled`);
        console.log(`📄 Task Contract: ${contractAddresses.taskContract}`);
        console.log(`🔍 Proof Contract: ${contractAddresses.proofContract}`);
        console.log(`🤝 Match Contract: ${contractAddresses.matchingContract}`);
      }
    });
    
  } catch (error) {
    logger.error({ error }, 'Failed to initialize server');
    console.error('❌ Server initialization failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Start the server only if this file is run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server.ts') || process.argv[1]?.includes('server.ts')) {
  initializeServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;