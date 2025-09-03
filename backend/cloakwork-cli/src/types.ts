// TypeScript interfaces for CloakWork API

// ==================
// Request Interfaces
// ==================

export interface CreateTaskRequest {
  title: string;
  description: string;
  requirements: string[];
  compensation: number;
  deadline: string; // ISO date string
  category: string;
  creatorSecret?: Uint8Array;
}

export interface ApplyToTaskRequest {
  taskId: string;
  applicantAddress: string;
  zkProof: string;
  proofMetadata: {
    skillClaims: string[];
    publicInputs: Record<string, any>;
  };
  message?: string;
}

export interface SubmitProofRequest {
  taskId: string;
  submitterAddress: string;
  proofData: {
    zkProof: string;
    publicInputs: Record<string, any>;
    witnessCommitment: string;
  };
  skillClaims: string[];
  submitterSecret?: Uint8Array;
}

export interface CreateMatchRequest {
  taskId: string;
  ownerId: string;
  contributorId: string;
  applicationId: string;
  ownerConsent: boolean;
  contributorConsent?: boolean;
}

export interface GetTasksQuery {
  category?: string;
  minCompensation?: number;
  maxCompensation?: number;
  skills?: string[];
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  limit?: number;
  offset?: number;
}

// ==================
// Response Interfaces
// ==================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface CreateTaskResponse {
  taskId: string;
  contractAddress: string;
  transactionId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  compensation: number;
  deadline: string;
  category: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  creatorAddress: string;
  contractAddress: string;
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApplyToTaskResponse {
  applicationId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  proofId: string;
  submittedAt: string;
}

export interface SubmitProofResponse {
  proofId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  contractAddress: string;
  transactionId: string;
  submittedAt: string;
}

export interface CreateMatchResponse {
  matchId: string;
  status: 'pending' | 'mutual_consent' | 'identities_revealed' | 'completed';
  contractAddress: string;
  createdAt: string;
}

// ==================
// Internal Data Types
// ==================

export interface Application {
  id: string;
  taskId: string;
  applicantAddress: string;
  zkProof: string;
  proofMetadata: {
    skillClaims: string[];
    publicInputs: Record<string, any>;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  message?: string;
  submittedAt: string;
}

export interface Proof {
  id: string;
  taskId: string;
  submitterAddress: string;
  zkProof: string;
  publicInputs: Record<string, any>;
  witnessCommitment: string;
  skillClaims: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  contractAddress: string;
  submittedAt: string;
}

export interface Match {
  id: string;
  taskId: string;
  ownerId: string;
  contributorId: string;
  applicationId: string;
  status: 'pending' | 'mutual_consent' | 'identities_revealed' | 'completed';
  ownerConsent: boolean;
  contributorConsent: boolean;
  contractAddress: string;
  createdAt: string;
  updatedAt: string;
}

// ==================
// Error Types
// ==================

export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  PROOF_VERIFICATION_ERROR = 'PROOF_VERIFICATION_ERROR',
  CONTRACT_INTERACTION_ERROR = 'CONTRACT_INTERACTION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface ApiError {
  code: ErrorCodes;
  message: string;
  details?: any;
  statusCode: number;
}

// ==================
// Validation Schemas
// ==================

export interface ValidationSchema {
  createTask: {
    title: { required: true; minLength: 3; maxLength: 100 };
    description: { required: true; minLength: 10; maxLength: 1000 };
    requirements: { required: true; minItems: 1; maxItems: 10 };
    compensation: { required: true; min: 0 };
    deadline: { required: true; format: 'date-time' };
    category: { required: true; minLength: 2; maxLength: 50 };
  };
  applyToTask: {
    taskId: { required: true; format: 'uuid' };
    applicantAddress: { required: true; format: 'address' };
    zkProof: { required: true; minLength: 1 };
    proofMetadata: { required: true };
  };
  submitProof: {
    taskId: { required: true; format: 'uuid' };
    submitterAddress: { required: true; format: 'address' };
    proofData: { required: true };
    skillClaims: { required: true; minItems: 1 };
  };
}