import { jest } from '@jest/globals';

// Mock Midnight.js modules
jest.mock('@midnight-ntwrk/midnight-js-contracts', () => ({
  createMidnightJSContract: jest.fn(),
  deployContract: jest.fn(),
}));

jest.mock('@midnight-ntwrk/midnight-js-types', () => ({
  Witnesses: {},
  CircuitInput: {},
}));

jest.mock('@midnight-ntwrk/ledger', () => ({
  balanceOf: jest.fn(),
  transfer: jest.fn(),
}));

// Mock Pino logger
jest.mock('pino', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => mockLogger),
  };
  return jest.fn(() => mockLogger);
});

// Global test utilities
global.testUtils = {
  createMockTask: () => ({
    id: 'test-task-1',
    title: 'Test Task',
    description: 'Test Description',
    reward: 100,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    requiredSkills: ['JavaScript'],
    owner: 'test-owner',
    status: 'open',
    contractId: 'mock-contract-id',
    transactionId: 'mock-tx-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicationsCount: 0,
  }),
  
  createMockApplication: () => ({
    id: 'test-app-1',
    taskId: 'test-task-1',
    applicant: 'test-applicant',
    coverLetter: 'Test cover letter',
    proposedTimeline: '1 week',
    zkProofHash: 'mock-proof-hash',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }),
  
  createMockProof: () => ({
    id: 'test-proof-1',
    taskId: 'test-task-1',
    submitter: 'test-submitter',
    proofData: 'mock-proof-data',
    description: 'Test proof description',
    isValid: true,
    verificationHash: 'mock-verification-hash',
    createdAt: new Date().toISOString(),
  }),
  
  createMockMatch: () => ({
    id: 'test-match-1',
    taskId: 'test-task-1',
    owner: 'test-owner',
    contributor: 'test-contributor',
    status: 'pending',
    ownerConsent: false,
    contributorConsent: false,
    createdAt: new Date().toISOString(),
  }),
};

// Extend Jest matchers
declare global {
  var testUtils: {
    createMockTask: () => any;
    createMockApplication: () => any;
    createMockProof: () => any;
    createMockMatch: () => any;
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for tests