import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  createTask(context: __compactRuntime.CircuitContext<T>,
             privateData_0: { requirementsCommitment: Uint8Array,
                              creatorSecret: Uint8Array
                            }): __compactRuntime.CircuitResults<T, Uint8Array>;
  editTask(context: __compactRuntime.CircuitContext<T>,
           taskId_0: Uint8Array,
           newPrivateData_0: { requirementsCommitment: Uint8Array,
                               creatorSecret: Uint8Array
                             }): __compactRuntime.CircuitResults<T, []>;
  removeTask(context: __compactRuntime.CircuitContext<T>,
             taskId_0: Uint8Array,
             creatorSecret_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getTask(context: __compactRuntime.CircuitContext<T>, taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, { creatorHash: Uint8Array,
                                                                                                                   encryptedRequirementsHash: Uint8Array,
                                                                                                                   status: number
                                                                                                                 }>;
  isTaskActive(context: __compactRuntime.CircuitContext<T>, taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  createTask(context: __compactRuntime.CircuitContext<T>,
             privateData_0: { requirementsCommitment: Uint8Array,
                              creatorSecret: Uint8Array
                            }): __compactRuntime.CircuitResults<T, Uint8Array>;
  editTask(context: __compactRuntime.CircuitContext<T>,
           taskId_0: Uint8Array,
           newPrivateData_0: { requirementsCommitment: Uint8Array,
                               creatorSecret: Uint8Array
                             }): __compactRuntime.CircuitResults<T, []>;
  removeTask(context: __compactRuntime.CircuitContext<T>,
             taskId_0: Uint8Array,
             creatorSecret_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getTask(context: __compactRuntime.CircuitContext<T>, taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, { creatorHash: Uint8Array,
                                                                                                                   encryptedRequirementsHash: Uint8Array,
                                                                                                                   status: number
                                                                                                                 }>;
  isTaskActive(context: __compactRuntime.CircuitContext<T>, taskId_0: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
}

export type Ledger = {
  tasks: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { creatorHash: Uint8Array,
                                 encryptedRequirementsHash: Uint8Array,
                                 status: number
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { creatorHash: Uint8Array, encryptedRequirementsHash: Uint8Array, status: number
}]>
  };
  readonly taskCounter: bigint;
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
