import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  submitProof(context: __compactRuntime.CircuitContext<T>,
              privateData_0: { submitterSecret: Uint8Array,
                               proofCommitment: Uint8Array,
                               taskSecret: Uint8Array
                             },
              proofType_0: number): __compactRuntime.CircuitResults<T, Uint8Array>;
  verifyProof(context: __compactRuntime.CircuitContext<T>,
              proofId_0: Uint8Array,
              verificationData_0: { verifierSecret: Uint8Array,
                                    isValid: boolean,
                                    verificationNotes: string
                                  }): __compactRuntime.CircuitResults<T, []>;
  getProof(context: __compactRuntime.CircuitContext<T>, proofId_0: Uint8Array): __compactRuntime.CircuitResults<T, { submitterHash: Uint8Array,
                                                                                                                     proofHash: Uint8Array,
                                                                                                                     proofType: number,
                                                                                                                     taskId: Uint8Array,
                                                                                                                     status: number,
                                                                                                                     timestamp: bigint
                                                                                                                   }>;
  getTaskProofs(context: __compactRuntime.CircuitContext<T>,
                taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  isProofVerified(context: __compactRuntime.CircuitContext<T>,
                  proofId_0: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
}

export type PureCircuits = {
  getVerifiedProofsBySubmitter(submitterHash_0: Uint8Array): bigint;
}

export type Circuits<T> = {
  submitProof(context: __compactRuntime.CircuitContext<T>,
              privateData_0: { submitterSecret: Uint8Array,
                               proofCommitment: Uint8Array,
                               taskSecret: Uint8Array
                             },
              proofType_0: number): __compactRuntime.CircuitResults<T, Uint8Array>;
  verifyProof(context: __compactRuntime.CircuitContext<T>,
              proofId_0: Uint8Array,
              verificationData_0: { verifierSecret: Uint8Array,
                                    isValid: boolean,
                                    verificationNotes: string
                                  }): __compactRuntime.CircuitResults<T, []>;
  getProof(context: __compactRuntime.CircuitContext<T>, proofId_0: Uint8Array): __compactRuntime.CircuitResults<T, { submitterHash: Uint8Array,
                                                                                                                     proofHash: Uint8Array,
                                                                                                                     proofType: number,
                                                                                                                     taskId: Uint8Array,
                                                                                                                     status: number,
                                                                                                                     timestamp: bigint
                                                                                                                   }>;
  getTaskProofs(context: __compactRuntime.CircuitContext<T>,
                taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  isProofVerified(context: __compactRuntime.CircuitContext<T>,
                  proofId_0: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
  getVerifiedProofsBySubmitter(context: __compactRuntime.CircuitContext<T>,
                               submitterHash_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
}

export type Ledger = {
  proofs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { submitterHash: Uint8Array,
                                 proofHash: Uint8Array,
                                 proofType: number,
                                 taskId: Uint8Array,
                                 status: number,
                                 timestamp: bigint
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { submitterHash: Uint8Array,
  proofHash: Uint8Array,
  proofType: number,
  taskId: Uint8Array,
  status: number,
  timestamp: bigint
}]>
  };
  readonly proofCounter: bigint;
  taskProofs: {
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
  verifiedProofs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
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
