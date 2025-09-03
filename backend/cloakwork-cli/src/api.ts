import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { type CoinInfo, nativeToken, Transaction, type TransactionId } from '@midnight-ntwrk/ledger';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import {
  type BalancedTransaction,
  createBalancedTx,
  type FinalizedTxData,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { assertIsContractAddress, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { type Resource, WalletBuilder } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { webcrypto } from 'crypto';
import pino, { type Logger } from 'pino';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import * as fsAsync from 'node:fs/promises';
import * as fs from 'node:fs';

import { contractPaths, type Config } from './config';

// Bind ws implementation for environments without global WebSocket
// @ts-ignore
globalThis.WebSocket = WebSocket as any;

let logger: Logger = pino({ level: 'info' });

// ==========================
// Types for contract helpers
// ==========================

// Task contract private state shape derived from compiled artifact
export type TaskPrivateState = {
  requirementsCommitment: Uint8Array;
  creatorSecret: Uint8Array;
};

// Proof contract private state
export type ProofPrivateState = {
  submitterSecret: Uint8Array;
  proofCommitment: Uint8Array;
  taskSecret: Uint8Array;
};

// Matching contract private state
export type MatchingPrivateState = {
  taskSecret: Uint8Array;
  ownerSecret: Uint8Array;
  contributorSecret: Uint8Array;
  proofSecret: Uint8Array;
};

export type BaseProviders = {
  privateStateProvider: any;
  publicDataProvider: any;
  zkConfigProvider: any;
  proofProvider: any;
  walletProvider: WalletProvider & MidnightProvider;
  midnightProvider: WalletProvider & MidnightProvider;
};

// ======================================
// Wallet provider bridging implementation
// ======================================

export const createWalletAndMidnightProvider = async (
  wallet: Wallet,
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    balanceTx(tx: UnbalancedTransaction, newCoins: CoinInfo[]): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
          newCoins,
        )
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()))
        .then(createBalancedTx);
    },
    submitTx(tx: BalancedTransaction): Promise<TransactionId> {
      return wallet.submitTransaction(tx);
    },
  };
};

// ======================
// Wallet helper routines
// ======================

export const waitForSync = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(
          `Waiting for sync. Backend lag: ${sourceGap}, wallet lag: ${applyGap}, transactions=${state.transactionHistory.length}`,
        );
      }),
      Rx.filter((state) => state.syncProgress !== undefined && state.syncProgress.synced),
    ),
  );

export const waitForSyncProgress = async (wallet: Wallet) =>
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(
          `Waiting for progress. Backend lag: ${sourceGap}, wallet lag: ${applyGap}, transactions=${state.transactionHistory.length}`,
        );
      }),
      Rx.filter((state) => state.syncProgress !== undefined),
    ),
  );

export const waitForFunds = (wallet: Wallet) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((state) => {
        const balance = state.balances[nativeToken()] ?? 0n;
        logger.info(`Waiting for funds. Current balance: ${balance}`);
      }),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

export const saveState = async (wallet: Wallet, filename: string) => {
  const directoryPath = process.env.SYNC_CACHE;
  if (directoryPath !== undefined) {
    logger.info(`Saving state in ${directoryPath}/${filename}`);
    try {
      await fsAsync.mkdir(directoryPath, { recursive: true });
      const serializedState = await wallet.serializeState();
      const writer = fs.createWriteStream(`${directoryPath}/${filename}`);
      writer.write(serializedState);
      writer.on('finish', function () {
        logger.info(`File '${directoryPath}/${filename}' written successfully.`);
      });
      writer.on('error', function (err) {
        logger.error(err);
      });
      writer.end();
    } catch (e) {
      if (typeof e === 'string') {
        logger.warn(e);
      } else if (e instanceof Error) {
        logger.warn(e.message);
      }
    }
  } else {
    logger.info('Not saving cache as sync cache was not defined');
  }
};

export const isAnotherChain = async (wallet: Wallet, offset: number) => {
  await waitForSyncProgress(wallet);
  const walletOffset = Number(JSON.parse(await wallet.serializeState()).offset);
  if (walletOffset < offset - 1) {
    logger.info(`Your offset is: ${walletOffset} restored offset: ${offset} so it is another chain`);
    return true;
  } else {
    logger.info(`Your offset is: ${walletOffset} restored offset: ${offset} ok`);
    return false;
  }
};

export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  webcrypto.getRandomValues(bytes);
  return bytes;
};

export const buildWalletAndWaitForFunds = async (
  { indexer, indexerWS, node, proofServer }: Config,
  seed: string,
  filename: string,
): Promise<Wallet & Resource> => {
  logger.info('Building wallet...');
  let wallet: Wallet & Resource;
  const indexerWsUrl = indexerWS;
  try {
    wallet = await WalletBuilder.buildFromSeed(indexer, indexerWsUrl, proofServer, node, seed, getZswapNetworkId(), 'info');
    wallet.start();
  } catch (e) {
    logger.warn('Failed initial wallet build attempt, retrying clean');
    wallet = await WalletBuilder.buildFromSeed(indexer, indexerWsUrl, proofServer, node, seed, getZswapNetworkId(), 'info');
    wallet.start();
  }

  const state = await Rx.firstValueFrom(wallet.state());
  logger.info(`Your wallet seed is: ${seed}`);
  logger.info(`Your wallet address is: ${state.address}`);
  let balance = state.balances[nativeToken()];
  if (balance === undefined || balance === 0n) {
    logger.info('Your wallet balance is: 0');
    logger.info('Waiting to receive tokens...');
    balance = await waitForFunds(wallet);
  }
  logger.info(`Your wallet balance is: ${balance}`);

  if (filename) {
    try {
      await saveState(wallet, filename);
    } catch {}
  }

  return wallet;
};

export const buildWalletFromExistingSeed = async (
  { indexer, indexerWS, node, proofServer }: Config,
  seed: string,
  filename: string,
): Promise<Wallet & Resource> => {
  logger.info('Building wallet from existing seed...');
  let wallet: Wallet & Resource;
  const indexerWsUrl = indexerWS;
  try {
    wallet = await WalletBuilder.buildFromSeed(indexer, indexerWsUrl, proofServer, node, seed, getZswapNetworkId(), 'info');
    wallet.start();
  } catch (e) {
    logger.warn('Failed initial wallet build attempt, retrying clean');
    wallet = await WalletBuilder.buildFromSeed(indexer, indexerWsUrl, proofServer, node, seed, getZswapNetworkId(), 'info');
    wallet.start();
  }

  const state = await Rx.firstValueFrom(wallet.state());
  logger.info(`Your wallet seed is: ${seed}`);
  logger.info(`Your wallet address is: ${state.address}`);
  const balance = state.balances[nativeToken()] || 0n;
  logger.info(`Your wallet balance is: ${balance}`);

  if (filename) {
    try {
      await saveState(wallet, filename);
    } catch {}
  }

  return wallet;
};

export const buildFreshWallet = async (config: Config): Promise<Wallet & Resource> =>
  await buildWalletAndWaitForFunds(config, toHex(randomBytes(32)), '');

export function setLogger(_logger: Logger) {
  logger = _logger;
}

// ==================
// Provider factories
// ==================

const buildCommonProviders = async (wallet: Wallet & Resource, config: Config) => {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);
  return {
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};

export const configureTaskProviders = async (wallet: Wallet & Resource, config: Config): Promise<BaseProviders> => {
  const common = await buildCommonProviders(wallet, config);
  return {
    ...common,
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: contractPaths.task.privateStateStoreName,
    }),
    zkConfigProvider: new NodeZkConfigProvider<'createTask' | 'editTask' | 'removeTask' | 'getTask' | 'isTaskActive'>(
      contractPaths.task.zkConfigPath,
    ),
  };
};

export const configureProofProviders = async (wallet: Wallet & Resource, config: Config): Promise<BaseProviders> => {
  const common = await buildCommonProviders(wallet, config);
  return {
    ...common,
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: contractPaths.proof.privateStateStoreName,
    }),
    zkConfigProvider: new NodeZkConfigProvider<'submitProof' | 'verifyProof' | 'getProof' | 'getTaskProofs' | 'isProofVerified' | 'getVerifiedProofsBySubmitter'>(
      contractPaths.proof.zkConfigPath,
    ),
  };
};

export const configureMatchingProviders = async (wallet: Wallet & Resource, config: Config): Promise<BaseProviders> => {
  const common = await buildCommonProviders(wallet, config);
  return {
    ...common,
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: contractPaths.matching.privateStateStoreName,
    }),
    zkConfigProvider: new NodeZkConfigProvider<
      | 'createMatch'
      | 'respondToMatch'
      | 'completeMatch'
      | 'giveOwnerConsent'
      | 'giveContributorConsent'
      | 'getMatch'
      | 'getTaskMatches'
      | 'areIdentitiesRevealed'
      | 'getRevealedIdentity'
    >(contractPaths.matching.zkConfigPath),
  };
};

// ==========================
// Contract instance helpers
// ==========================

// Import compiled contract artifacts (CommonJS). Use require via dynamic import compatibility.
// We import as namespace for typesafety.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as TaskContract from '../../contracts/managed/task_contract/contract/index.cjs';
// @ts-ignore
import * as ProofContract from '../../contracts/managed/proof_contract/contract/index.cjs';
// @ts-ignore
import * as MatchingContract from '../../contracts/managed/matching_contract/contract/index.cjs';

export const taskContractInstance = new (TaskContract as any).Contract({});
export const proofContractInstance = new (ProofContract as any).Contract({});
export const matchingContractInstance = new (MatchingContract as any).Contract({});

// ======================
// Deploy / Join helpers
// ======================

export const joinTaskContract = async (providers: BaseProviders, contractAddress: string) => {
  assertIsContractAddress(contractAddress);
  return await findDeployedContract(providers as any, {
    contract: taskContractInstance as any,
    contractAddress: contractAddress as unknown as ContractAddress,
  } as any);
};

export const joinProofContract = async (providers: BaseProviders, contractAddress: string) => {
  assertIsContractAddress(contractAddress);
  return await findDeployedContract(providers as any, {
    contract: proofContractInstance as any,
    contractAddress: contractAddress as unknown as ContractAddress,
  } as any);
};

export const joinMatchingContract = async (providers: BaseProviders, contractAddress: string) => {
  assertIsContractAddress(contractAddress);
  return await findDeployedContract(providers as any, {
    contract: matchingContractInstance as any,
    contractAddress: contractAddress as unknown as ContractAddress,
  } as any);
};

export const deployTaskContract = async (providers: BaseProviders, privateState: TaskPrivateState) =>
  await deployContract(providers as any, {
    contract: taskContractInstance as any,
    privateStateId: 'taskPrivateState',
    initialPrivateState: privateState as any,
  } as any);

export const deployProofContract = async (providers: BaseProviders, privateState: ProofPrivateState) =>
  await deployContract(providers as any, {
    contract: proofContractInstance as any,
    privateStateId: 'proofPrivateState',
    initialPrivateState: privateState as any,
  } as any);

export const deployMatchingContract = async (providers: BaseProviders, privateState: MatchingPrivateState) =>
  await deployContract(providers as any, {
    contract: matchingContractInstance as any,
    privateStateId: 'matchingPrivateState',
    initialPrivateState: privateState as any,
  } as any);