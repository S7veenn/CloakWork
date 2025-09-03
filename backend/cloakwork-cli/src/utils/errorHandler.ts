import pino from 'pino';
import { ApiError, ErrorCodes } from '../types';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Contract-specific error types
export enum ContractErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  PROOF_VERIFICATION_FAILED = 'PROOF_VERIFICATION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTRACT_NOT_DEPLOYED = 'CONTRACT_NOT_DEPLOYED',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

// Enhanced error class for contract operations
export class ContractError extends Error {
  public readonly type: ContractErrorType;
  public readonly originalError?: Error;
  public readonly transactionId?: string;
  public readonly contractAddress?: string;

  constructor(
    type: ContractErrorType,
    message: string,
    originalError?: Error,
    transactionId?: string,
    contractAddress?: string
  ) {
    super(message);
    this.name = 'ContractError';
    this.type = type;
    this.originalError = originalError;
    this.transactionId = transactionId;
    this.contractAddress = contractAddress;
  }
}

// Error mapping for different contract error types
const contractErrorMapping: Record<ContractErrorType, { code: ErrorCodes; statusCode: number }> = {
  [ContractErrorType.CONNECTION_FAILED]: {
    code: ErrorCodes.BLOCKCHAIN_CONNECTION_ERROR,
    statusCode: 503
  },
  [ContractErrorType.TRANSACTION_FAILED]: {
    code: ErrorCodes.TRANSACTION_FAILED,
    statusCode: 400
  },
  [ContractErrorType.PROOF_VERIFICATION_FAILED]: {
    code: ErrorCodes.PROOF_VERIFICATION_ERROR,
    statusCode: 400
  },
  [ContractErrorType.INSUFFICIENT_FUNDS]: {
    code: ErrorCodes.INSUFFICIENT_FUNDS,
    statusCode: 400
  },
  [ContractErrorType.CONTRACT_NOT_DEPLOYED]: {
    code: ErrorCodes.CONTRACT_NOT_FOUND,
    statusCode: 503
  },
  [ContractErrorType.INVALID_PARAMETERS]: {
    code: ErrorCodes.VALIDATION_ERROR,
    statusCode: 400
  },
  [ContractErrorType.TIMEOUT]: {
    code: ErrorCodes.TIMEOUT_ERROR,
    statusCode: 408
  },
  [ContractErrorType.NETWORK_ERROR]: {
    code: ErrorCodes.NETWORK_ERROR,
    statusCode: 503
  }
};

// Utility function to handle contract operations with proper error handling
export async function handleContractOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  contractName?: string,
  retryCount: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      logger.info({ operationName, contractName, attempt }, 'Executing contract operation');
      
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new ContractError(
            ContractErrorType.TIMEOUT,
            `Operation ${operationName} timed out after 30 seconds`
          )), 30000)
        )
      ]);
      
      logger.info({ operationName, contractName, attempt }, 'Contract operation completed successfully');
      return result;
      
    } catch (error) {
      lastError = error as Error;
      
      logger.warn({
        operationName,
        contractName,
        attempt,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, `Contract operation failed (attempt ${attempt}/${retryCount})`);
      
      // Don't retry on certain error types
      if (error instanceof ContractError) {
        if ([
          ContractErrorType.INVALID_PARAMETERS,
          ContractErrorType.PROOF_VERIFICATION_FAILED,
          ContractErrorType.CONTRACT_NOT_DEPLOYED
        ].includes(error.type)) {
          throw error;
        }
      }
      
      // Wait before retrying (except on last attempt)
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  // All retries failed
  logger.error({
    operationName,
    contractName,
    retryCount,
    error: lastError.message,
    stack: lastError.stack
  }, 'Contract operation failed after all retries');
  
  throw lastError;
}

// Convert contract errors to API errors
export function contractErrorToApiError(error: Error, operationName: string): ApiError {
  if (error instanceof ContractError) {
    const mapping = contractErrorMapping[error.type];
    return {
      code: mapping.code,
      message: error.message,
      details: [
        `Operation: ${operationName}`,
        error.transactionId ? `Transaction ID: ${error.transactionId}` : null,
        error.contractAddress ? `Contract: ${error.contractAddress}` : null,
        error.originalError ? `Original error: ${error.originalError.message}` : null
      ].filter(Boolean),
      statusCode: mapping.statusCode
    };
  }
  
  // Handle common blockchain/network errors
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Network connection error',
      details: [error.message],
      statusCode: 503
    };
  }
  
  if (errorMessage.includes('timeout')) {
    return {
      code: ErrorCodes.TIMEOUT_ERROR,
      message: 'Operation timed out',
      details: [error.message],
      statusCode: 408
    };
  }
  
  if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
    return {
      code: ErrorCodes.INSUFFICIENT_FUNDS,
      message: 'Insufficient funds for transaction',
      details: [error.message],
      statusCode: 400
    };
  }
  
  // Default to internal server error
  return {
    code: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    details: [error.message],
    statusCode: 500
  };
}

// Utility function to validate contract initialization
export function validateContractInitialization(
  contracts: { name: string; instance: any }[]
): void {
  const uninitializedContracts = contracts.filter(c => !c.instance);
  
  if (uninitializedContracts.length > 0) {
    const contractNames = uninitializedContracts.map(c => c.name).join(', ');
    throw new ContractError(
      ContractErrorType.CONTRACT_NOT_DEPLOYED,
      `Contracts not initialized: ${contractNames}`,
      undefined,
      undefined,
      contractNames
    );
  }
}

// Utility function to log contract operation metrics
export function logContractMetrics(
  operationName: string,
  contractName: string,
  startTime: number,
  success: boolean,
  transactionId?: string
): void {
  const duration = Date.now() - startTime;
  
  logger.info({
    operationName,
    contractName,
    duration,
    success,
    transactionId
  }, 'Contract operation metrics');
}

// Middleware for handling contract errors in Express routes
export function contractErrorMiddleware() {
  return (error: Error, req: any, res: any, next: any) => {
    if (error instanceof ContractError || error.message.includes('contract')) {
      const apiError = contractErrorToApiError(error, req.route?.path || 'unknown');
      
      logger.error({
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      }, 'Contract error in API endpoint');
      
      return res.status(apiError.statusCode || 500).json({
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details
        },
        timestamp: new Date().toISOString()
      });
    }
    
    next(error);
  };
}