// Temporarily commented out to fix startup issues
// import { ContractAddress } from '@midnight-ntwrk/midnight-js-contracts';

// Mock type for now
type ContractAddress = string;

// Contract configuration for CloakWork
export interface ContractConfig {
  taskContract: {
    address: ContractAddress | null;
    circuitName: string;
  };
  proofContract: {
    address: ContractAddress | null;
    circuitName: string;
  };
  matchingContract: {
    address: ContractAddress | null;
    circuitName: string;
  };
}

// Default configuration - addresses will be set after deployment
export const contractConfig: ContractConfig = {
  taskContract: {
    address: process.env.TASK_CONTRACT_ADDRESS as ContractAddress || null,
    circuitName: 'task_contract'
  },
  proofContract: {
    address: process.env.PROOF_CONTRACT_ADDRESS as ContractAddress || null,
    circuitName: 'proof_contract'
  },
  matchingContract: {
    address: process.env.MATCHING_CONTRACT_ADDRESS as ContractAddress || null,
    circuitName: 'matching_contract'
  }
};

// Validation function to ensure contracts are properly configured
export function validateContractConfig(): boolean {
  return !!(contractConfig.taskContract.address &&
    contractConfig.proofContract.address &&
    contractConfig.matchingContract.address);
}

// Helper function to get contract address with validation
export function getContractAddress(contractType: keyof ContractConfig): ContractAddress {
  const address = contractConfig[contractType].address;
  if (!address) {
    throw new Error(`${contractType} address not configured. Please deploy contracts and set environment variables.`);
  }
  return address;
}

// Circuit names for contract compilation
export const CIRCUIT_NAMES = {
  TASK_CONTRACT: 'task_contract',
  PROOF_CONTRACT: 'proof_contract',
  MATCHING_CONTRACT: 'matching_contract'
} as const;

// Contract deployment status
export interface DeploymentStatus {
  taskContract: boolean;
  proofContract: boolean;
  matchingContract: boolean;
}

export function getDeploymentStatus(): DeploymentStatus {
  return {
    taskContract: !!contractConfig.taskContract.address,
    proofContract: !!contractConfig.proofContract.address,
    matchingContract: !!contractConfig.matchingContract.address
  };
}