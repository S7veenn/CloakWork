import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import pino from 'pino';
import { ErrorCodes } from './types.js';
import { taskContractInstance, proofContractInstance, matchingContractInstance } from './api.js';
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
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    }, 'Incoming request');
    next();
});
// Global error handler
app.use((err, req, res, next) => {
    logger.error({ err, req: req.url }, 'Unhandled error');
    const response = {
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
    compensation: Joi.number().min(0).required(),
    deadline: Joi.date().iso().required(),
    category: Joi.string().min(2).max(50).required(),
    creatorSecret: Joi.binary().optional()
});
const applyToTaskSchema = Joi.object({
    taskId: Joi.string().uuid().required(),
    applicantAddress: Joi.string().required(),
    zkProof: Joi.string().min(1).required(),
    proofMetadata: Joi.object({
        skillClaims: Joi.array().items(Joi.string()).required(),
        publicInputs: Joi.object().required()
    }).required(),
    message: Joi.string().max(500).optional()
});
const submitProofSchema = Joi.object({
    taskId: Joi.string().uuid().required(),
    submitterAddress: Joi.string().required(),
    proofData: Joi.object({
        zkProof: Joi.string().required(),
        publicInputs: Joi.object().required(),
        witnessCommitment: Joi.string().required()
    }).required(),
    skillClaims: Joi.array().items(Joi.string()).min(1).required(),
    submitterSecret: Joi.binary().optional()
});
const createMatchSchema = Joi.object({
    taskId: Joi.string().uuid().required(),
    ownerId: Joi.string().required(),
    contributorId: Joi.string().required(),
    applicationId: Joi.string().uuid().required(),
    ownerConsent: Joi.boolean().required(),
    contributorConsent: Joi.boolean().optional()
});
// In-memory storage (replace with database in production)
const tasks = new Map();
const applications = new Map();
const proofs = new Map();
const matches = new Map();
// Contract instances (will be initialized on startup)
let taskContract = taskContractInstance;
let proofContract = proofContractInstance;
let matchingContract = matchingContractInstance;
// Utility functions
function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
function createSuccessResponse(data) {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };
}
function createErrorResponse(error) {
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
function validateRequest(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const apiError = {
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
app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ status: 'healthy', timestamp: new Date().toISOString() }));
});
// POST /tasks - Create and store a new task
app.post('/tasks', validateRequest(createTaskSchema), async (req, res) => {
    try {
        const taskData = req.body;
        const taskId = generateId();
        logger.info({ taskId, taskData }, 'Creating new task');
        // Deploy task contract (simplified - in production, this would be more complex)
        const contractAddress = `contract_${taskId}`;
        const transactionId = `tx_${taskId}`;
        const task = {
            id: taskId,
            title: taskData.title,
            description: taskData.description,
            requirements: taskData.requirements,
            compensation: taskData.compensation,
            deadline: taskData.deadline,
            category: taskData.category,
            status: 'open',
            creatorAddress: 'creator_address', // Would come from authentication
            contractAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applicationsCount: 0
        };
        tasks.set(taskId, task);
        const response = {
            taskId,
            contractAddress,
            transactionId,
            createdAt: task.createdAt
        };
        logger.info({ taskId, contractAddress }, 'Task created successfully');
        res.status(201).json(createSuccessResponse(response));
    }
    catch (error) {
        logger.error({ error }, 'Error creating task');
        const apiError = {
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Failed to create task',
            details: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500
        };
        res.status(500).json(createErrorResponse(apiError));
    }
});
// GET /tasks - Retrieve list of available tasks
app.get('/tasks', (req, res) => {
    try {
        const query = req.query;
        let filteredTasks = Array.from(tasks.values());
        // Apply filters
        if (query.category) {
            filteredTasks = filteredTasks.filter(task => task.category === query.category);
        }
        if (query.minCompensation) {
            filteredTasks = filteredTasks.filter(task => task.compensation >= Number(query.minCompensation));
        }
        if (query.maxCompensation) {
            filteredTasks = filteredTasks.filter(task => task.compensation <= Number(query.maxCompensation));
        }
        if (query.status) {
            filteredTasks = filteredTasks.filter(task => task.status === query.status);
        }
        if (query.skills && query.skills.length > 0) {
            const skills = Array.isArray(query.skills) ? query.skills : [query.skills];
            filteredTasks = filteredTasks.filter(task => skills.some(skill => task.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))));
        }
        // Pagination
        const limit = Math.min(Number(query.limit) || 20, 100);
        const offset = Number(query.offset) || 0;
        const total = filteredTasks.length;
        const paginatedTasks = filteredTasks.slice(offset, offset + limit);
        const response = {
            tasks: paginatedTasks,
            total,
            limit,
            offset
        };
        logger.info({ total, limit, offset }, 'Retrieved tasks');
        res.json(createSuccessResponse(response));
    }
    catch (error) {
        logger.error({ error }, 'Error retrieving tasks');
        const apiError = {
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Failed to retrieve tasks',
            details: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500
        };
        res.status(500).json(createErrorResponse(apiError));
    }
});
// POST /apply - Process task applications with Zero-Knowledge Proof verification
app.post('/apply', validateRequest(applyToTaskSchema), async (req, res) => {
    try {
        const applicationData = req.body;
        const applicationId = generateId();
        logger.info({ applicationId, taskId: applicationData.taskId }, 'Processing task application');
        // Check if task exists
        const task = tasks.get(applicationData.taskId);
        if (!task) {
            const apiError = {
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Task not found',
                statusCode: 404
            };
            return res.status(404).json(createErrorResponse(apiError));
        }
        // Verify ZK proof (simplified - in production, this would use actual ZK verification)
        const verificationStatus = 'verified'; // Mock verification
        const proofId = generateId();
        const application = {
            id: applicationId,
            taskId: applicationData.taskId,
            applicantAddress: applicationData.applicantAddress,
            zkProof: applicationData.zkProof,
            proofMetadata: applicationData.proofMetadata,
            verificationStatus,
            message: applicationData.message,
            submittedAt: new Date().toISOString()
        };
        applications.set(applicationId, application);
        // Update task applications count
        task.applicationsCount += 1;
        tasks.set(task.id, task);
        const response = {
            applicationId,
            verificationStatus,
            proofId,
            submittedAt: application.submittedAt
        };
        logger.info({ applicationId, verificationStatus }, 'Application processed successfully');
        res.status(201).json(createSuccessResponse(response));
    }
    catch (error) {
        logger.error({ error }, 'Error processing application');
        const apiError = {
            code: ErrorCodes.PROOF_VERIFICATION_ERROR,
            message: 'Failed to process application',
            details: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500
        };
        res.status(500).json(createErrorResponse(apiError));
    }
});
// POST /proofs - Handle proof submissions
app.post('/proofs', validateRequest(submitProofSchema), async (req, res) => {
    try {
        const proofData = req.body;
        const proofId = generateId();
        logger.info({ proofId, taskId: proofData.taskId }, 'Processing proof submission');
        // Check if task exists
        const task = tasks.get(proofData.taskId);
        if (!task) {
            const apiError = {
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Task not found',
                statusCode: 404
            };
            return res.status(404).json(createErrorResponse(apiError));
        }
        // Verify proof (simplified - in production, this would use actual ZK verification)
        const verificationStatus = 'verified'; // Mock verification
        const contractAddress = `proof_contract_${proofId}`;
        const transactionId = `proof_tx_${proofId}`;
        const proof = {
            id: proofId,
            taskId: proofData.taskId,
            submitterAddress: proofData.submitterAddress,
            zkProof: proofData.proofData.zkProof,
            publicInputs: proofData.proofData.publicInputs,
            witnessCommitment: proofData.proofData.witnessCommitment,
            skillClaims: proofData.skillClaims,
            verificationStatus,
            contractAddress,
            submittedAt: new Date().toISOString()
        };
        proofs.set(proofId, proof);
        const response = {
            proofId,
            verificationStatus,
            contractAddress,
            transactionId,
            submittedAt: proof.submittedAt
        };
        logger.info({ proofId, verificationStatus }, 'Proof submitted successfully');
        res.status(201).json(createSuccessResponse(response));
    }
    catch (error) {
        logger.error({ error }, 'Error submitting proof');
        const apiError = {
            code: ErrorCodes.PROOF_VERIFICATION_ERROR,
            message: 'Failed to submit proof',
            details: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500
        };
        res.status(500).json(createErrorResponse(apiError));
    }
});
// POST /match - Execute matching algorithm between task owners and contributors
app.post('/match', validateRequest(createMatchSchema), async (req, res) => {
    try {
        const matchData = req.body;
        const matchId = generateId();
        logger.info({ matchId, taskId: matchData.taskId }, 'Creating match');
        // Check if task exists
        const task = tasks.get(matchData.taskId);
        if (!task) {
            const apiError = {
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Task not found',
                statusCode: 404
            };
            return res.status(404).json(createErrorResponse(apiError));
        }
        // Check if application exists
        const application = applications.get(matchData.applicationId);
        if (!application) {
            const apiError = {
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Application not found',
                statusCode: 404
            };
            return res.status(404).json(createErrorResponse(apiError));
        }
        const contractAddress = `match_contract_${matchId}`;
        const status = matchData.contributorConsent ? 'mutual_consent' : 'pending';
        const match = {
            id: matchId,
            taskId: matchData.taskId,
            ownerId: matchData.ownerId,
            contributorId: matchData.contributorId,
            applicationId: matchData.applicationId,
            status,
            ownerConsent: matchData.ownerConsent,
            contributorConsent: matchData.contributorConsent || false,
            contractAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        matches.set(matchId, match);
        // Update task status if match is successful
        if (status === 'mutual_consent') {
            task.status = 'in_progress';
            tasks.set(task.id, task);
        }
        const response = {
            matchId,
            status,
            contractAddress,
            createdAt: match.createdAt
        };
        logger.info({ matchId, status }, 'Match created successfully');
        res.status(201).json(createSuccessResponse(response));
    }
    catch (error) {
        logger.error({ error }, 'Error creating match');
        const apiError = {
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Failed to create match',
            details: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500
        };
        res.status(500).json(createErrorResponse(apiError));
    }
});
// 404 handler
app.use('*', (req, res) => {
    const apiError = {
        code: ErrorCodes.RESOURCE_NOT_FOUND,
        message: 'Endpoint not found',
        statusCode: 404
    };
    res.status(404).json(createErrorResponse(apiError));
});
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
    }
    catch (error) {
        logger.error({ error }, 'Failed to initialize server');
        process.exit(1);
    }
}
// Start the server
if (require.main === module) {
    initializeServer();
}
export default app;
//# sourceMappingURL=server.js.map