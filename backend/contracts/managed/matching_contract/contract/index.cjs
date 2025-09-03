'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.8.1';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_2 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeField();

class _MatchInfo_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment()))))));
  }
  fromValue(value_0) {
    return {
      taskId: _descriptor_0.fromValue(value_0),
      ownerHash: _descriptor_0.fromValue(value_0),
      contributorHash: _descriptor_0.fromValue(value_0),
      proofId: _descriptor_0.fromValue(value_0),
      status: _descriptor_1.fromValue(value_0),
      revealStatus: _descriptor_2.fromValue(value_0),
      timestamp: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.taskId).concat(_descriptor_0.toValue(value_0.ownerHash).concat(_descriptor_0.toValue(value_0.contributorHash).concat(_descriptor_0.toValue(value_0.proofId).concat(_descriptor_1.toValue(value_0.status).concat(_descriptor_2.toValue(value_0.revealStatus).concat(_descriptor_3.toValue(value_0.timestamp)))))));
  }
}

const _descriptor_4 = new _MatchInfo_0();

const _descriptor_5 = new __compactRuntime.CompactTypeBoolean();

const _descriptor_6 = new __compactRuntime.CompactTypeOpaqueString();

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _Maybe_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_5.fromValue(value_0),
      value: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_some).concat(_descriptor_0.toValue(value_0.value));
  }
}

const _descriptor_8 = new _Maybe_0();

class _IdentityRevealData_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_5.alignment())));
  }
  fromValue(value_0) {
    return {
      matchId: _descriptor_0.fromValue(value_0),
      participantSecret: _descriptor_0.fromValue(value_0),
      encryptedIdentity: _descriptor_6.fromValue(value_0),
      consentGiven: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.matchId).concat(_descriptor_0.toValue(value_0.participantSecret).concat(_descriptor_6.toValue(value_0.encryptedIdentity).concat(_descriptor_5.toValue(value_0.consentGiven))));
  }
}

const _descriptor_9 = new _IdentityRevealData_0();

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _PrivateMatchData_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())));
  }
  fromValue(value_0) {
    return {
      taskSecret: _descriptor_0.fromValue(value_0),
      ownerSecret: _descriptor_0.fromValue(value_0),
      contributorSecret: _descriptor_0.fromValue(value_0),
      proofSecret: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.taskSecret).concat(_descriptor_0.toValue(value_0.ownerSecret).concat(_descriptor_0.toValue(value_0.contributorSecret).concat(_descriptor_0.toValue(value_0.proofSecret))));
  }
}

const _descriptor_11 = new _PrivateMatchData_0();

class _tuple_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_3.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_3.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_3.toValue(value_0[1]));
  }
}

const _descriptor_12 = new _tuple_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_13 = new _ContractAddress_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_15 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      createMatch: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`createMatch: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const privateData_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('createMatch',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 56 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(privateData_0) === 'object' && privateData_0.taskSecret.buffer instanceof ArrayBuffer && privateData_0.taskSecret.BYTES_PER_ELEMENT === 1 && privateData_0.taskSecret.length === 32 && privateData_0.ownerSecret.buffer instanceof ArrayBuffer && privateData_0.ownerSecret.BYTES_PER_ELEMENT === 1 && privateData_0.ownerSecret.length === 32 && privateData_0.contributorSecret.buffer instanceof ArrayBuffer && privateData_0.contributorSecret.BYTES_PER_ELEMENT === 1 && privateData_0.contributorSecret.length === 32 && privateData_0.proofSecret.buffer instanceof ArrayBuffer && privateData_0.proofSecret.BYTES_PER_ELEMENT === 1 && privateData_0.proofSecret.length === 32)) {
          __compactRuntime.type_error('createMatch',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 56 char 1',
                                      'struct PrivateMatchData<taskSecret: Bytes<32>, ownerSecret: Bytes<32>, contributorSecret: Bytes<32>, proofSecret: Bytes<32>>',
                                      privateData_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_11.toValue(privateData_0),
            alignment: _descriptor_11.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createMatch_0(context,
                                             partialProofData,
                                             privateData_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      respondToMatch: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`respondToMatch: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const ownerSecret_0 = args_1[2];
        const accept_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('respondToMatch',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 95 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.type_error('respondToMatch',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 95 char 1',
                                      'Bytes<32>',
                                      matchId_0)
        }
        if (!(ownerSecret_0.buffer instanceof ArrayBuffer && ownerSecret_0.BYTES_PER_ELEMENT === 1 && ownerSecret_0.length === 32)) {
          __compactRuntime.type_error('respondToMatch',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'matching_contract.compact line 95 char 1',
                                      'Bytes<32>',
                                      ownerSecret_0)
        }
        if (!(typeof(accept_0) === 'boolean')) {
          __compactRuntime.type_error('respondToMatch',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'matching_contract.compact line 95 char 1',
                                      'Boolean',
                                      accept_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_0.toValue(ownerSecret_0).concat(_descriptor_5.toValue(accept_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_5.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._respondToMatch_0(context,
                                                partialProofData,
                                                matchId_0,
                                                ownerSecret_0,
                                                accept_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      completeMatch: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`completeMatch: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const contributorSecret_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('completeMatch',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 124 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.type_error('completeMatch',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 124 char 1',
                                      'Bytes<32>',
                                      matchId_0)
        }
        if (!(contributorSecret_0.buffer instanceof ArrayBuffer && contributorSecret_0.BYTES_PER_ELEMENT === 1 && contributorSecret_0.length === 32)) {
          __compactRuntime.type_error('completeMatch',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'matching_contract.compact line 124 char 1',
                                      'Bytes<32>',
                                      contributorSecret_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_0.toValue(contributorSecret_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._completeMatch_0(context,
                                               partialProofData,
                                               matchId_0,
                                               contributorSecret_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      giveOwnerConsent: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`giveOwnerConsent: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const revealData_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('giveOwnerConsent',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 150 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(revealData_0) === 'object' && revealData_0.matchId.buffer instanceof ArrayBuffer && revealData_0.matchId.BYTES_PER_ELEMENT === 1 && revealData_0.matchId.length === 32 && revealData_0.participantSecret.buffer instanceof ArrayBuffer && revealData_0.participantSecret.BYTES_PER_ELEMENT === 1 && revealData_0.participantSecret.length === 32 && true && typeof(revealData_0.consentGiven) === 'boolean')) {
          __compactRuntime.type_error('giveOwnerConsent',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 150 char 1',
                                      'struct IdentityRevealData<matchId: Bytes<32>, participantSecret: Bytes<32>, encryptedIdentity: Opaque<"string">, consentGiven: Boolean>',
                                      revealData_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_9.toValue(revealData_0),
            alignment: _descriptor_9.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._giveOwnerConsent_0(context,
                                                  partialProofData,
                                                  revealData_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      giveContributorConsent: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`giveContributorConsent: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const revealData_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('giveContributorConsent',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 174 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(typeof(revealData_0) === 'object' && revealData_0.matchId.buffer instanceof ArrayBuffer && revealData_0.matchId.BYTES_PER_ELEMENT === 1 && revealData_0.matchId.length === 32 && revealData_0.participantSecret.buffer instanceof ArrayBuffer && revealData_0.participantSecret.BYTES_PER_ELEMENT === 1 && revealData_0.participantSecret.length === 32 && true && typeof(revealData_0.consentGiven) === 'boolean')) {
          __compactRuntime.type_error('giveContributorConsent',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 174 char 1',
                                      'struct IdentityRevealData<matchId: Bytes<32>, participantSecret: Bytes<32>, encryptedIdentity: Opaque<"string">, consentGiven: Boolean>',
                                      revealData_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_9.toValue(revealData_0),
            alignment: _descriptor_9.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._giveContributorConsent_0(context,
                                                        partialProofData,
                                                        revealData_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getMatch: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getMatch: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getMatch',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 224 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.type_error('getMatch',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 224 char 1',
                                      'Bytes<32>',
                                      matchId_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getMatch_0(context, partialProofData, matchId_0);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getTaskMatches: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getTaskMatches: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const taskId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getTaskMatches',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 229 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(taskId_0.buffer instanceof ArrayBuffer && taskId_0.BYTES_PER_ELEMENT === 1 && taskId_0.length === 32)) {
          __compactRuntime.type_error('getTaskMatches',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 229 char 1',
                                      'Bytes<32>',
                                      taskId_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(taskId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getTaskMatches_0(context,
                                                partialProofData,
                                                taskId_0);
        partialProofData.output = { value: _descriptor_7.toValue(result_0), alignment: _descriptor_7.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      areIdentitiesRevealed: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`areIdentitiesRevealed: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('areIdentitiesRevealed',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 238 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.type_error('areIdentitiesRevealed',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 238 char 1',
                                      'Bytes<32>',
                                      matchId_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._areIdentitiesRevealed_0(context,
                                                       partialProofData,
                                                       matchId_0);
        partialProofData.output = { value: _descriptor_5.toValue(result_0), alignment: _descriptor_5.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getRevealedIdentity: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`getRevealedIdentity: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const matchId_0 = args_1[1];
        const participantHash_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getRevealedIdentity',
                                      'argument 1 (as invoked from Typescript)',
                                      'matching_contract.compact line 244 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(matchId_0.buffer instanceof ArrayBuffer && matchId_0.BYTES_PER_ELEMENT === 1 && matchId_0.length === 32)) {
          __compactRuntime.type_error('getRevealedIdentity',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'matching_contract.compact line 244 char 1',
                                      'Bytes<32>',
                                      matchId_0)
        }
        if (!(participantHash_0.buffer instanceof ArrayBuffer && participantHash_0.BYTES_PER_ELEMENT === 1 && participantHash_0.length === 32)) {
          __compactRuntime.type_error('getRevealedIdentity',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'matching_contract.compact line 244 char 1',
                                      'Bytes<32>',
                                      participantHash_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(matchId_0).concat(_descriptor_0.toValue(participantHash_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getRevealedIdentity_0(context,
                                                     partialProofData,
                                                     matchId_0,
                                                     participantHash_0);
        partialProofData.output = { value: _descriptor_6.toValue(result_0), alignment: _descriptor_6.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      createMatch: this.circuits.createMatch,
      respondToMatch: this.circuits.respondToMatch,
      completeMatch: this.circuits.completeMatch,
      giveOwnerConsent: this.circuits.giveOwnerConsent,
      giveContributorConsent: this.circuits.giveContributorConsent,
      getMatch: this.circuits.getMatch,
      getTaskMatches: this.circuits.getTaskMatches,
      areIdentitiesRevealed: this.circuits.areIdentitiesRevealed,
      getRevealedIdentity: this.circuits.getRevealedIdentity
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('createMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('respondToMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('completeMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('giveOwnerConsent', new __compactRuntime.ContractOperation());
    state_0.setOperation('giveContributorConsent', new __compactRuntime.ContractOperation());
    state_0.setOperation('getMatch', new __compactRuntime.ContractOperation());
    state_0.setOperation('getTaskMatches', new __compactRuntime.ContractOperation());
    state_0.setOperation('areIdentitiesRevealed', new __compactRuntime.ContractOperation());
    state_0.setOperation('getRevealedIdentity', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(0n),
                                                                            alignment: _descriptor_14.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                            alignment: _descriptor_14.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                            alignment: _descriptor_7.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                            alignment: _descriptor_14.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                            alignment: _descriptor_14.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(4n),
                                                                            alignment: _descriptor_14.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(5n),
                                                                            alignment: _descriptor_14.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_12, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_0, value_0);
    return result_0;
  }
  _createMatch_0(context, partialProofData, privateData_0) {
    const matchId_0 = this._persistentHash_0([privateData_0.taskSecret,
                                              _descriptor_7.fromValue(Contract._query(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(1n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value)]);
    const taskId_0 = this._persistentHash_1(privateData_0.taskSecret);
    const ownerHash_0 = this._persistentHash_1(privateData_0.ownerSecret);
    const contributorHash_0 = this._persistentHash_1(privateData_0.contributorSecret);
    const proofId_0 = this._persistentHash_1(privateData_0.proofSecret);
    __compactRuntime.assert(!_descriptor_5.fromValue(Contract._query(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_14.toValue(0n),
                                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                             alignment: _descriptor_0.alignment() }).encode() } },
                                                                      'member',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value),
                            'Match ID already exists');
    const matchInfo_0 = { taskId: taskId_0,
                          ownerHash: ownerHash_0,
                          contributorHash: contributorHash_0,
                          proofId: proofId_0,
                          status: 0,
                          revealStatus: 0,
                          timestamp:
                            _descriptor_7.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_14.toValue(1n),
                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value) };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(0n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(matchInfo_0),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(1n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_10.toValue(tmp_0),
                                              alignment: _descriptor_10.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    if (_descriptor_5.fromValue(Contract._query(context,
                                                partialProofData,
                                                [
                                                 { dup: { n: 0 } },
                                                 { idx: { cached: false,
                                                          pushPath: false,
                                                          path: [
                                                                 { tag: 'value',
                                                                   value: { value: _descriptor_14.toValue(2n),
                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                 { push: { storage: false,
                                                           value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(taskId_0),
                                                                                                        alignment: _descriptor_0.alignment() }).encode() } },
                                                 'member',
                                                 { popeq: { cached: true,
                                                            result: undefined } }]).value))
    {
      Contract._query(context,
                      partialProofData,
                      [
                       { idx: { cached: false,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(2n),
                                                  alignment: _descriptor_14.alignment() } },
                                       { tag: 'value',
                                         value: { value: _descriptor_0.toValue(taskId_0),
                                                  alignment: _descriptor_0.alignment() } }] } },
                       { dup: { n: 0 } },
                       { idx: { cached: false,
                                pushPath: false,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(2n),
                                                  alignment: _descriptor_14.alignment() } }] } },
                       { addi: { immediate: 1 } },
                       { push: { storage: true,
                                 value: __compactRuntime.StateValue.newArray()
                                          .arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                           alignment: _descriptor_0.alignment() })).arrayPush(__compactRuntime.StateValue.newNull()).arrayPush(__compactRuntime.StateValue.newNull())
                                          .encode() } },
                       { swap: { n: 0 } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                       { swap: { n: 0 } },
                       { ins: { cached: true, n: 1 } },
                       { swap: { n: 0 } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                       { swap: { n: 0 } },
                       { ins: { cached: true, n: 3 } }]);
    } else {
      Contract._query(context,
                      partialProofData,
                      [
                       { idx: { cached: false,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(2n),
                                                  alignment: _descriptor_14.alignment() } }] } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(taskId_0),
                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                       { push: { storage: true,
                                 value: __compactRuntime.StateValue.newArray()
                                          .arrayPush(__compactRuntime.StateValue.newNull()).arrayPush(__compactRuntime.StateValue.newNull()).arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                                                                                                                             alignment: _descriptor_7.alignment() }))
                                          .encode() } },
                       { ins: { cached: false, n: 1 } },
                       { ins: { cached: true, n: 1 } }]);
      Contract._query(context,
                      partialProofData,
                      [
                       { idx: { cached: false,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(2n),
                                                  alignment: _descriptor_14.alignment() } },
                                       { tag: 'value',
                                         value: { value: _descriptor_0.toValue(taskId_0),
                                                  alignment: _descriptor_0.alignment() } }] } },
                       { dup: { n: 0 } },
                       { idx: { cached: false,
                                pushPath: false,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(2n),
                                                  alignment: _descriptor_14.alignment() } }] } },
                       { addi: { immediate: 1 } },
                       { push: { storage: true,
                                 value: __compactRuntime.StateValue.newArray()
                                          .arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                           alignment: _descriptor_0.alignment() })).arrayPush(__compactRuntime.StateValue.newNull()).arrayPush(__compactRuntime.StateValue.newNull())
                                          .encode() } },
                       { swap: { n: 0 } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                       { swap: { n: 0 } },
                       { ins: { cached: true, n: 1 } },
                       { swap: { n: 0 } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                       { swap: { n: 0 } },
                       { ins: { cached: true, n: 3 } }]);
    }
    return matchId_0;
  }
  _respondToMatch_0(context,
                    partialProofData,
                    matchId_0,
                    ownerSecret_0,
                    accept_0)
  {
    const match_0 = _descriptor_4.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_14.toValue(0n),
                                                                                        alignment: _descriptor_14.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    __compactRuntime.assert(match_0.status === 0, 'Match not pending');
    const expectedOwnerHash_0 = this._persistentHash_1(ownerSecret_0);
    __compactRuntime.assert(this._equal_0(expectedOwnerHash_0, match_0.ownerHash),
                            'Not the task owner');
    const newStatus_0 = accept_0 ? 1 : 2;
    const updatedMatch_0 = { taskId: match_0.taskId,
                             ownerHash: match_0.ownerHash,
                             contributorHash: match_0.contributorHash,
                             proofId: match_0.proofId,
                             status: newStatus_0,
                             revealStatus: match_0.revealStatus,
                             timestamp: match_0.timestamp };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(0n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updatedMatch_0),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _completeMatch_0(context, partialProofData, matchId_0, contributorSecret_0) {
    const match_0 = _descriptor_4.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_14.toValue(0n),
                                                                                        alignment: _descriptor_14.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    __compactRuntime.assert(match_0.status === 1, 'Match not accepted');
    const expectedContributorHash_0 = this._persistentHash_1(contributorSecret_0);
    __compactRuntime.assert(this._equal_1(expectedContributorHash_0,
                                          match_0.contributorHash),
                            'Not the contributor');
    const updatedMatch_0 = { taskId: match_0.taskId,
                             ownerHash: match_0.ownerHash,
                             contributorHash: match_0.contributorHash,
                             proofId: match_0.proofId,
                             status: 3,
                             revealStatus: match_0.revealStatus,
                             timestamp: match_0.timestamp };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(0n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updatedMatch_0),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _giveOwnerConsent_0(context, partialProofData, revealData_0) {
    let tmp_0;
    const match_0 = (tmp_0 = revealData_0.matchId,
                     _descriptor_4.fromValue(Contract._query(context,
                                                             partialProofData,
                                                             [
                                                              { dup: { n: 0 } },
                                                              { idx: { cached: false,
                                                                       pushPath: false,
                                                                       path: [
                                                                              { tag: 'value',
                                                                                value: { value: _descriptor_14.toValue(0n),
                                                                                         alignment: _descriptor_14.alignment() } }] } },
                                                              { idx: { cached: false,
                                                                       pushPath: false,
                                                                       path: [
                                                                              { tag: 'value',
                                                                                value: { value: _descriptor_0.toValue(tmp_0),
                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                              { popeq: { cached: false,
                                                                         result: undefined } }]).value));
    __compactRuntime.assert(match_0.status === 1 || match_0.status === 3,
                            'Invalid match status');
    const expectedOwnerHash_0 = this._persistentHash_1(revealData_0.participantSecret);
    __compactRuntime.assert(this._equal_2(expectedOwnerHash_0, match_0.ownerHash),
                            'Not the task owner');
    const consentPublic_0 = revealData_0.consentGiven;
    const tmp_1 = revealData_0.matchId;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(3n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(consentPublic_0),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    if (consentPublic_0) {
      const tmp_2 = match_0.ownerHash;
      const tmp_3 = revealData_0.encryptedIdentity;
      Contract._query(context,
                      partialProofData,
                      [
                       { idx: { cached: false,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(5n),
                                                  alignment: _descriptor_14.alignment() } }] } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                       { push: { storage: true,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(tmp_3),
                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                       { ins: { cached: false, n: 1 } },
                       { ins: { cached: true, n: 1 } }]);
    }
    this._updateRevealStatus_0(context, partialProofData, revealData_0.matchId);
    return [];
  }
  _giveContributorConsent_0(context, partialProofData, revealData_0) {
    let tmp_0;
    const match_0 = (tmp_0 = revealData_0.matchId,
                     _descriptor_4.fromValue(Contract._query(context,
                                                             partialProofData,
                                                             [
                                                              { dup: { n: 0 } },
                                                              { idx: { cached: false,
                                                                       pushPath: false,
                                                                       path: [
                                                                              { tag: 'value',
                                                                                value: { value: _descriptor_14.toValue(0n),
                                                                                         alignment: _descriptor_14.alignment() } }] } },
                                                              { idx: { cached: false,
                                                                       pushPath: false,
                                                                       path: [
                                                                              { tag: 'value',
                                                                                value: { value: _descriptor_0.toValue(tmp_0),
                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                              { popeq: { cached: false,
                                                                         result: undefined } }]).value));
    __compactRuntime.assert(match_0.status === 1 || match_0.status === 3,
                            'Invalid match status');
    const expectedContributorHash_0 = this._persistentHash_1(revealData_0.participantSecret);
    __compactRuntime.assert(this._equal_3(expectedContributorHash_0,
                                          match_0.contributorHash),
                            'Not the contributor');
    const consentPublic_0 = revealData_0.consentGiven;
    const tmp_1 = revealData_0.matchId;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(4n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(consentPublic_0),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    if (consentPublic_0) {
      const tmp_2 = match_0.contributorHash;
      const tmp_3 = revealData_0.encryptedIdentity;
      Contract._query(context,
                      partialProofData,
                      [
                       { idx: { cached: false,
                                pushPath: true,
                                path: [
                                       { tag: 'value',
                                         value: { value: _descriptor_14.toValue(5n),
                                                  alignment: _descriptor_14.alignment() } }] } },
                       { push: { storage: false,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_2),
                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                       { push: { storage: true,
                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(tmp_3),
                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                       { ins: { cached: false, n: 1 } },
                       { ins: { cached: true, n: 1 } }]);
    }
    this._updateRevealStatus_0(context, partialProofData, revealData_0.matchId);
    return [];
  }
  _updateRevealStatus_0(context, partialProofData, matchId_0) {
    const match_0 = _descriptor_4.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_14.toValue(0n),
                                                                                        alignment: _descriptor_14.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    const ownerConsent_0 = _descriptor_5.fromValue(Contract._query(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_14.toValue(3n),
                                                                                               alignment: _descriptor_14.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                           alignment: _descriptor_0.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value)
                           &&
                           _descriptor_5.fromValue(Contract._query(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_14.toValue(3n),
                                                                                               alignment: _descriptor_14.alignment() } }] } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_0.toValue(matchId_0),
                                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                                    { popeq: { cached: false,
                                                                               result: undefined } }]).value);
    const contributorConsent_0 = _descriptor_5.fromValue(Contract._query(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value)
                                 &&
                                 _descriptor_5.fromValue(Contract._query(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(matchId_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
    const newRevealStatus_0 = ownerConsent_0 && contributorConsent_0 ?
                              3 :
                              ownerConsent_0 ? 1 : contributorConsent_0 ? 2 : 0;
    const updatedMatch_0 = { taskId: match_0.taskId,
                             ownerHash: match_0.ownerHash,
                             contributorHash: match_0.contributorHash,
                             proofId: match_0.proofId,
                             status: match_0.status,
                             revealStatus: newRevealStatus_0,
                             timestamp: match_0.timestamp };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_14.toValue(0n),
                                                alignment: _descriptor_14.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(matchId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(updatedMatch_0),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _getMatch_0(context, partialProofData, matchId_0) {
    return _descriptor_4.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_14.toValue(0n),
                                                                               alignment: _descriptor_14.alignment() } }] } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_0.toValue(matchId_0),
                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  _getTaskMatches_0(context, partialProofData, taskId_0) {
    if (_descriptor_5.fromValue(Contract._query(context,
                                                partialProofData,
                                                [
                                                 { dup: { n: 0 } },
                                                 { idx: { cached: false,
                                                          pushPath: false,
                                                          path: [
                                                                 { tag: 'value',
                                                                   value: { value: _descriptor_14.toValue(2n),
                                                                            alignment: _descriptor_14.alignment() } }] } },
                                                 { push: { storage: false,
                                                           value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(taskId_0),
                                                                                                        alignment: _descriptor_0.alignment() }).encode() } },
                                                 'member',
                                                 { popeq: { cached: true,
                                                            result: undefined } }]).value))
    {
      return _descriptor_7.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_14.toValue(2n),
                                                                                 alignment: _descriptor_14.alignment() } },
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_0.toValue(taskId_0),
                                                                                 alignment: _descriptor_0.alignment() } }] } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_14.toValue(2n),
                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    } else {
      return 0n;
    }
  }
  _areIdentitiesRevealed_0(context, partialProofData, matchId_0) {
    const match_0 = _descriptor_4.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_14.toValue(0n),
                                                                                        alignment: _descriptor_14.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    return match_0.revealStatus === 3;
  }
  _getRevealedIdentity_0(context, partialProofData, matchId_0, participantHash_0)
  {
    const match_0 = _descriptor_4.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_14.toValue(0n),
                                                                                        alignment: _descriptor_14.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_0.toValue(matchId_0),
                                                                                        alignment: _descriptor_0.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    __compactRuntime.assert(match_0.revealStatus === 3,
                            'Identities not mutually revealed');
    __compactRuntime.assert(this._equal_4(participantHash_0, match_0.ownerHash)
                            ||
                            this._equal_5(participantHash_0,
                                          match_0.contributorHash),
                            'Not a participant in this match');
    return _descriptor_6.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_14.toValue(5n),
                                                                               alignment: _descriptor_14.alignment() } }] } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_0.toValue(participantHash_0),
                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    matches: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                                               alignment: _descriptor_7.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'matching_contract.compact line 48 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'matching_contract.compact line 48 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_4.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get matchCounter() {
      return _descriptor_7.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_14.toValue(1n),
                                                                                 alignment: _descriptor_14.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    taskMatches: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(2n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                                               alignment: _descriptor_7.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(2n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'matching_contract.compact line 50 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(2n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'matching_contract.compact line 50 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        if (state.asArray()[2].asMap().get({ value: _descriptor_0.toValue(key_0),
                                             alignment: _descriptor_0.alignment() }) === undefined) {
          throw new __compactRuntime.CompactError(`Map value undefined for ${key_0}`);
        }
        return {
          isEmpty(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_5.fromValue(Contract._query(context,
                                                           partialProofData,
                                                           [
                                                            { dup: { n: 0 } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_14.toValue(2n),
                                                                                       alignment: _descriptor_14.alignment() } },
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_0.toValue(key_0),
                                                                                       alignment: _descriptor_0.alignment() } }] } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_14.toValue(1n),
                                                                                       alignment: _descriptor_14.alignment() } }] } },
                                                            'type',
                                                            { push: { storage: false,
                                                                      value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                                                   alignment: _descriptor_14.alignment() }).encode() } },
                                                            'eq',
                                                            { popeq: { cached: true,
                                                                       result: undefined } }]).value);
          },
          length(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`length: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_7.fromValue(Contract._query(context,
                                                           partialProofData,
                                                           [
                                                            { dup: { n: 0 } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_14.toValue(2n),
                                                                                       alignment: _descriptor_14.alignment() } },
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_0.toValue(key_0),
                                                                                       alignment: _descriptor_0.alignment() } }] } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_14.toValue(2n),
                                                                                       alignment: _descriptor_14.alignment() } }] } },
                                                            { popeq: { cached: true,
                                                                       result: undefined } }]).value);
          },
          head(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`head: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_8.fromValue(Contract._query(context,
                                                           partialProofData,
                                                           [
                                                            { dup: { n: 0 } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_14.toValue(2n),
                                                                                       alignment: _descriptor_14.alignment() } },
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_0.toValue(key_0),
                                                                                       alignment: _descriptor_0.alignment() } }] } },
                                                            { idx: { cached: false,
                                                                     pushPath: false,
                                                                     path: [
                                                                            { tag: 'value',
                                                                              value: { value: _descriptor_14.toValue(0n),
                                                                                       alignment: _descriptor_14.alignment() } }] } },
                                                            { dup: { n: 0 } },
                                                            'type',
                                                            { push: { storage: false,
                                                                      value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                                                   alignment: _descriptor_14.alignment() }).encode() } },
                                                            'eq',
                                                            { branch: { skip: 4 } },
                                                            { push: { storage: false,
                                                                      value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                                                   alignment: _descriptor_14.alignment() }).encode() } },
                                                            { swap: { n: 0 } },
                                                            { concat: { cached: false,
                                                                        n: (2+Number(__compactRuntime.maxAlignedSize(
                                                                                _descriptor_0
                                                                                .alignment()
                                                                              ))) } },
                                                            { jmp: { skip: 2 } },
                                                            'pop',
                                                            { push: { storage: false,
                                                                      value: __compactRuntime.StateValue.newCell(__compactRuntime.alignedConcat(
                                                                                                                   { value: _descriptor_14.toValue(0n),
                                                                                                                     alignment: _descriptor_14.alignment() },
                                                                                                                   { value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                                                     alignment: _descriptor_0.alignment() }
                                                                                                                 )).encode() } },
                                                            { popeq: { cached: true,
                                                                       result: undefined } }]).value);
          },
          [Symbol.iterator](...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_1.length}`);
            }
            const self_0 = state.asArray()[2].asMap().get({ value: _descriptor_0.toValue(key_0),
                                                            alignment: _descriptor_0.alignment() });
            return (() => {  var iter = { curr: self_0 };  iter.next = () => {    const arr = iter.curr.asArray();    const head = arr[0];    if(head.type() == "null") {      return { done: true };    } else {      iter.curr = arr[1];      return { value: _descriptor_0.fromValue(head.asCell().value), done: false };    }  };  return iter;})();
          }
        }
      }
    },
    ownerConsents: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(3n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                                               alignment: _descriptor_7.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(3n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'matching_contract.compact line 51 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(3n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'matching_contract.compact line 51 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(3n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_5.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    contributorConsents: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(4n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                                               alignment: _descriptor_7.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(4n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'matching_contract.compact line 52 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(4n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'matching_contract.compact line 52 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(4n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_5.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    revealedIdentities: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(5n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n),
                                                                                                               alignment: _descriptor_7.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(5n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'matching_contract.compact line 53 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(5n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'matching_contract.compact line 53 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_6.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_14.toValue(5n),
                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
const pureCircuits = {};
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
