import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

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

// Mock contract instances for development
const mockContractInstance = {
  createTask: async () => ({ success: true, taskId: 'mock-task-id' }),
  getTask: async () => ({ success: true, task: null }),
  submitProof: async () => ({ success: true, proofId: 'mock-proof-id' }),
  createMatch: async () => ({ success: true, matchId: 'mock-match-id' })
};

const taskContractInstance = mockContractInstance;
const proofContractInstance = mockContractInstance;
const matchingContractInstance = mockContractInstance;

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
const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, req: req.url }, 'Unhandled error');
  
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal server error'
    },
    timestamp: new Date().toISOString()
  };
  
  res.status(500).json(response);
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

// In-memory storage (replace with database in production)
const tasks: Map<string, Task> = new Map();
const applications: Map<string, Application> = new Map();
const proofs: Map<string, Proof> = new Map();
const matches: Map<string, Match> = new Map();

// Contract instances (will be initialized on startup)
let taskContract = taskContractInstance;
let proofContract = proofContractInstance;
let matchingContract = matchingContractInstance;

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

// POST /tasks - Create and store a new task
app.post('/api/tasks', validateRequest(createTaskSchema), async (req: Request, res: Response) => {
  try {
    const taskData = req.body;
    const taskId = generateId();
    
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
    
    logger.info({ taskId, taskData }, 'Creating new task');
    
    // Deploy task contract (simplified - in production, this would be more complex)
    const contractAddress = `contract_${taskId}`;
    const transactionId = `tx_${taskId}`;
    
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
    logger.info({ taskId }, 'Task created successfully');
    res.status(201).json(task);
    
  } catch (error) {
    logger.error({ error }, 'Error creating task');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// GET /tasks - Retrieve list of tasks with filtering and pagination
app.get('/api/tasks', (req: Request, res: Response) => {
  try {
    const query: any = req.query;
    
    // Validate pagination parameters
    const page = Number(query.page);
    const limit = Number(query.limit);
    
    if ((query.page !== undefined && (page < 0 || isNaN(page))) || 
        (query.limit !== undefined && (limit <= 0 || isNaN(limit)))) {
      const apiError: ApiError = {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid pagination parameters',
        statusCode: 400
      };
      return res.status(400).json(createErrorResponse(apiError));
    }
    
    let filteredTasks = Array.from(tasks.values());
    
    // Apply filters
    if (query.owner) {
      filteredTasks = filteredTasks.filter((task: any) => task.ownerId === query.owner);
    }
    
    if (query.category) {
      filteredTasks = filteredTasks.filter((task: any) => task.category === query.category);
    }
    
    if (query.minCompensation) {
      filteredTasks = filteredTasks.filter((task: any) => task.compensation >= Number(query.minCompensation));
    }
    
    if (query.maxCompensation) {
      filteredTasks = filteredTasks.filter((task: any) => task.compensation <= Number(query.maxCompensation));
    }
    
    if (query.status) {
      filteredTasks = filteredTasks.filter((task: any) => task.status === query.status);
    }
    
    if (query.skills && query.skills.length > 0) {
      const skills = Array.isArray(query.skills) ? query.skills : [query.skills];
      filteredTasks = filteredTasks.filter((task: any) => 
        skills.some((skill: string) => task.requirements.some((req: string) => req.toLowerCase().includes(skill.toLowerCase())))
      );
    }
    
    // Pagination
    const finalLimit = Math.min(Number(query.limit) || 20, 100);
    const offset = Number(query.offset) || 0;
    const total = filteredTasks.length;
    
    const paginatedTasks = filteredTasks.slice(offset, offset + finalLimit);
    
    // Frontend expects just the array of tasks, not wrapped response
    logger.info({ total, limit: finalLimit, offset }, 'Retrieved tasks');
    res.json(paginatedTasks);
    
  } catch (error) {
    logger.error({ error }, 'Error retrieving tasks');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to retrieve tasks',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// POST /tasks/:id/apply - Handle task applications
app.post('/api/tasks/:id/apply', validateRequest(applyToTaskSchema), async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const applicationData = req.body;
    const applicationId = generateId();
    
    logger.info({ taskId, applicationId }, 'Processing task application');
    
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

// GET /proofs - Retrieve list of proofs
app.get('/api/proofs', (req: Request, res: Response) => {
  try {
    const proofsList = Array.from(proofs.values());
    logger.info({ count: proofsList.length }, 'Retrieved proofs');
    res.json(proofsList);
  } catch (error) {
    logger.error({ error }, 'Error retrieving proofs');
    const apiError: ApiError = {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to retrieve proofs',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
  }
});

// POST /proofs - Handle proof submissions
app.post('/api/proofs', validateRequest(submitProofSchema), async (req: Request, res: Response) => {
  try {
    const proofData = req.body;
    const proofId = generateId();
    
    logger.info({ proofId, taskId: proofData.taskId }, 'Processing proof submission');
    
    // Check if task exists
    const task = tasks.get(proofData.taskId);
    if (!task) {
      const apiError: ApiError = {
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        message: 'Task not found',
        statusCode: 404
      };
      return res.status(404).json(createErrorResponse(apiError));
    }
    
    // Verify proof (simplified - in production, this would use actual ZK verification)
    const verified = Math.random() > 0.3; // Mock 70% success rate
    
    const proof = {
      id: proofId,
      taskId: proofData.taskId,
      contributorId: proofData.contributorId,
      type: proofData.type,
      description: proofData.description,
      zkProof: proofData.zkProof,
      verified: verified,
      timestamp: new Date().toISOString()
    };
    
    proofs.set(proofId, proof as any);
    logger.info({ proofId, verified }, 'Proof submitted successfully');
    res.status(201).json(proof);
    
  } catch (error) {
    logger.error({ error }, 'Error submitting proof');
    const apiError: ApiError = {
      code: ErrorCodes.PROOF_VERIFICATION_ERROR,
      message: 'Failed to submit proof',
      details: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500
    };
    res.status(500).json(createErrorResponse(apiError));
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

// Initialize contracts and start server
async function initializeServer() {
  try {
    logger.info('Initializing CloakWork API server...');
    
    // Initialize Midnight.js contracts (simplified)
    logger.info('Contracts initialized (mock)');
    
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'CloakWork API server started successfully');
      console.log(`🚀 CloakWork API server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    logger.error({ error }, 'Failed to initialize server');
    process.exit(1);
  }
}

// Start the server only if this file is run directly
if (import.meta.url.endsWith('server.ts') || import.meta.url.includes('server.ts')) {
  initializeServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;