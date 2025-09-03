// CloakWork CLI configuration for Testnet deployment
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..', '..');
const managedRoot = path.resolve(root, 'contracts', 'managed');

export interface ContractPaths {
  readonly zkConfigPath: string;
  readonly privateStateStoreName: string;
}

export const contractPaths = {
  task: {
    zkConfigPath: path.resolve(managedRoot, 'task_contract'),
    privateStateStoreName: 'task-private-state',
  } as ContractPaths,
  proof: {
    zkConfigPath: path.resolve(managedRoot, 'proof_contract'),
    privateStateStoreName: 'proof-private-state',
  } as ContractPaths,
  matching: {
    zkConfigPath: path.resolve(managedRoot, 'matching_contract'),
    privateStateStoreName: 'matching-private-state',
  } as ContractPaths,
};

export interface Config {
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly proofServer: string;
}

// Testnet remote endpoints (use local proof-server)
export class TestnetRemoteConfig implements Config {
  indexer = 'https://indexer.testnet-02.midnight.network/api/v1/graphql';
  indexerWS = 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
  node = 'https://rpc.testnet-02.midnight.network';
  proofServer = 'http://127.0.0.1:6300';
  constructor() {
    setNetworkId(NetworkId.TestNet);
  }
}