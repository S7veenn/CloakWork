import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  createMatch(context: __compactRuntime.CircuitContext<T>,
              privateData_0: { taskSecret: Uint8Array,
                               ownerSecret: Uint8Array,
                               contributorSecret: Uint8Array,
                               proofSecret: Uint8Array
                             }): __compactRuntime.CircuitResults<T, Uint8Array>;
  respondToMatch(context: __compactRuntime.CircuitContext<T>,
                 matchId_0: Uint8Array,
                 ownerSecret_0: Uint8Array,
                 accept_0: boolean): __compactRuntime.CircuitResults<T, []>;
  completeMatch(context: __compactRuntime.CircuitContext<T>,
                matchId_0: Uint8Array,
                contributorSecret_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  giveOwnerConsent(context: __compactRuntime.CircuitContext<T>,
                   revealData_0: { matchId: Uint8Array,
                                   participantSecret: Uint8Array,
                                   encryptedIdentity: string,
                                   consentGiven: boolean
                                 }): __compactRuntime.CircuitResults<T, []>;
  giveContributorConsent(context: __compactRuntime.CircuitContext<T>,
                         revealData_0: { matchId: Uint8Array,
                                         participantSecret: Uint8Array,
                                         encryptedIdentity: string,
                                         consentGiven: boolean
                                       }): __compactRuntime.CircuitResults<T, []>;
  getMatch(context: __compactRuntime.CircuitContext<T>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<T, { taskId: Uint8Array,
                                                                                                                     ownerHash: Uint8Array,
                                                                                                                     contributorHash: Uint8Array,
                                                                                                                     proofId: Uint8Array,
                                                                                                                     status: number,
                                                                                                                     revealStatus: number,
                                                                                                                     timestamp: bigint
                                                                                                                   }>;
  getTaskMatches(context: __compactRuntime.CircuitContext<T>,
                 taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  areIdentitiesRevealed(context: __compactRuntime.CircuitContext<T>,
                        matchId_0: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
  getRevealedIdentity(context: __compactRuntime.CircuitContext<T>,
                      matchId_0: Uint8Array,
                      participantHash_0: Uint8Array): __compactRuntime.CircuitResults<T, string>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  createMatch(context: __compactRuntime.CircuitContext<T>,
              privateData_0: { taskSecret: Uint8Array,
                               ownerSecret: Uint8Array,
                               contributorSecret: Uint8Array,
                               proofSecret: Uint8Array
                             }): __compactRuntime.CircuitResults<T, Uint8Array>;
  respondToMatch(context: __compactRuntime.CircuitContext<T>,
                 matchId_0: Uint8Array,
                 ownerSecret_0: Uint8Array,
                 accept_0: boolean): __compactRuntime.CircuitResults<T, []>;
  completeMatch(context: __compactRuntime.CircuitContext<T>,
                matchId_0: Uint8Array,
                contributorSecret_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  giveOwnerConsent(context: __compactRuntime.CircuitContext<T>,
                   revealData_0: { matchId: Uint8Array,
                                   participantSecret: Uint8Array,
                                   encryptedIdentity: string,
                                   consentGiven: boolean
                                 }): __compactRuntime.CircuitResults<T, []>;
  giveContributorConsent(context: __compactRuntime.CircuitContext<T>,
                         revealData_0: { matchId: Uint8Array,
                                         participantSecret: Uint8Array,
                                         encryptedIdentity: string,
                                         consentGiven: boolean
                                       }): __compactRuntime.CircuitResults<T, []>;
  getMatch(context: __compactRuntime.CircuitContext<T>, matchId_0: Uint8Array): __compactRuntime.CircuitResults<T, { taskId: Uint8Array,
                                                                                                                     ownerHash: Uint8Array,
                                                                                                                     contributorHash: Uint8Array,
                                                                                                                     proofId: Uint8Array,
                                                                                                                     status: number,
                                                                                                                     revealStatus: number,
                                                                                                                     timestamp: bigint
                                                                                                                   }>;
  getTaskMatches(context: __compactRuntime.CircuitContext<T>,
                 taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  areIdentitiesRevealed(context: __compactRuntime.CircuitContext<T>,
                        matchId_0: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
  getRevealedIdentity(context: __compactRuntime.CircuitContext<T>,
                      matchId_0: Uint8Array,
                      participantHash_0: Uint8Array): __compactRuntime.CircuitResults<T, string>;
}

export type Ledger = {
  matches: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { taskId: Uint8Array,
                                 ownerHash: Uint8Array,
                                 contributorHash: Uint8Array,
                                 proofId: Uint8Array,
                                 status: number,
                                 revealStatus: number,
                                 timestamp: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { taskId: Uint8Array,
  ownerHash: Uint8Array,
  contributorHash: Uint8Array,
  proofId: Uint8Array,
  status: number,
  revealStatus: number,
  timestamp: bigint
}]>
  };
  readonly matchCounter: bigint;
  taskMatches: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): {
      isEmpty(): boolean;
      length(): bigint;
      head(): { is_some: boolean, value: Uint8Array };
      [Symbol.iterator](): Iterator<Uint8Array>
    }
  };
  ownerConsents: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  contributorConsents: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  revealedIdentities: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): string;
    [Symbol.iterator](): Iterator<[Uint8Array, string]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
