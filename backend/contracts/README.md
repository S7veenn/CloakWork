# CloakWork Smart Contracts

This folder contains the smart contracts for the CloakWork platform, built using the Midnight Network's Compact language. The platform consists of three interconnected contracts that enable privacy-preserving task management, zero-knowledge proof validation, and secure matching with identity revelation.

## Contract Overview

### 1. Task Contract (`task_contract.compact`)
Manages the creation, editing, and removal of tasks while preserving privacy.

**Key Features:**
- Private task requirements storage
- Creator identity protection
- Task lifecycle management
- Zero-knowledge proof of ownership

**Main Circuits:**
- `createTask`: Creates a new task with encrypted requirements
- `editTask`: Modifies task requirements (owner only)
- `removeTask`: Removes a task (owner only)
- `getTask`: Retrieves public task information
- `isTaskActive`: Checks if a task is still active

### 2. Proof Contract (`proof_contract.compact`)
Handles zero-knowledge proof submission and verification for task completion.

**Key Features:**
- ZK proof submission and storage
- Proof verification with cryptographic validation
- Task-proof relationship tracking
- Submitter identity protection

**Main Circuits:**
- `submitProof`: Submits a ZK proof for a specific task
- `verifyProof`: Verifies submitted proofs using cryptographic validation
- `getProof`: Retrieves proof information
- `getTaskProofs`: Gets all proofs for a specific task
- `isProofVerified`: Checks verification status
- `getVerifiedProofsBySubmitter`: Gets verified proofs by submitter

### 3. Matching Contract (`matching_contract.compact`)
Facilitates secure matching between task owners and contributors with conditional identity revelation.

**Key Features:**
- Secure matching creation and management
- Dual consent mechanism (owner + contributor)
- Conditional identity revelation
- Match completion tracking

**Main Circuits:**
- `createMatch`: Creates a match between task and proof
- `respondToMatch`: Contributor responds to match request
- `completeMatch`: Finalizes the match
- `giveOwnerConsent`: Task owner gives consent for identity revelation
- `giveContributorConsent`: Contributor gives consent for identity revelation
- `updateRevealStatus`: Updates identity revelation status
- `getMatch`: Retrieves match information
- `areIdentitiesRevealed`: Checks if identities are revealed
- `getRevealedIdentity`: Gets revealed identity information

## Contract Interaction Flow

1. **Task Creation**: Task owner creates a task using the Task Contract
2. **Proof Submission**: Contributors submit ZK proofs using the Proof Contract
3. **Proof Verification**: Proofs are verified cryptographically
4. **Match Creation**: Matching Contract creates matches between tasks and verified proofs
5. **Consent Process**: Both parties provide consent for identity revelation
6. **Match Completion**: Match is completed and identities are revealed (if consented)

## Configuration

The contracts are configured via `config.json`:

```json
{
  "contracts": {
    "taskContract": {
      "name": "CloakWork Task Contract",
      "file": "task_contract.compact",
      "description": "Manages privacy-preserving task creation and management"
    },
    "proofContract": {
      "name": "CloakWork Proof Contract", 
      "file": "proof_contract.compact",
      "description": "Handles ZK proof submission and verification"
    },
    "matchingContract": {
      "name": "CloakWork Matching Contract",
      "file": "matching_contract.compact", 
      "description": "Facilitates secure matching and identity revelation"
    }
  },
  "deployment": {
    "deploymentOrder": ["taskContract", "proofContract", "matchingContract"]
  }
}
```

## Deployment

### Prerequisites
- Midnight CLI installed
- Lace wallet with tDUST tokens from the testnet faucet
- Proof server running on `localhost:6300`
- Docker container: `midnightnetwork/proof-server:4.0.0`

### Quick Start

1. **Start the proof server:**
   ```bash
   docker run -d -p 6300:6300 --name midnight-proof-server midnightnetwork/proof-server:4.0.0
   ```

2. **Deploy contracts:**
   ```powershell
   .\deploy.ps1
   ```

3. **Run tests:**
   ```bash
   node test_contract.js
   ```

### Manual Deployment

1. **Compile contracts:**
   ```bash
   midnight compile task_contract.compact -o task_contract.wasm
   midnight compile proof_contract.compact -o proof_contract.wasm
   midnight compile matching_contract.compact -o matching_contract.wasm
   ```

2. **Deploy to testnet:**
   ```bash
   midnight deploy task_contract.wasm --wallet <your-wallet-address> --network testnet
   midnight deploy proof_contract.wasm --wallet <your-wallet-address> --network testnet
   midnight deploy matching_contract.wasm --wallet <your-wallet-address> --network testnet
   ```

## Testing

The `test_contract.js` file provides comprehensive integration tests covering:

- Task creation and management
- ZK proof submission and verification
- Match creation and completion
- Identity revelation process
- Error handling and edge cases

**Run tests:**
```bash
node test_contract.js
```

## Security Considerations

1. **Private Data Protection**: All sensitive data is stored encrypted and only accessible through zero-knowledge proofs
2. **Identity Privacy**: Identities are only revealed with explicit consent from both parties
3. **Proof Verification**: All proofs undergo cryptographic verification before acceptance
4. **Access Control**: Only authorized parties can modify or access specific contract data
5. **Replay Protection**: Contracts include mechanisms to prevent replay attacks

## File Structure

```
backend/contracts/
├── task_contract.compact      # Task management contract
├── proof_contract.compact     # ZK proof handling contract
├── matching_contract.compact  # Matching and identity revelation contract
├── config.json               # Contract configuration
├── deploy.ps1                # Deployment script
├── test_contract.js          # Integration tests
└── README.md                 # This documentation
```

## Integration with Frontend

After deployment, update your frontend configuration with the deployed contract addresses:

```javascript
const contractAddresses = {
  taskContract: 'deployed_task_contract_address',
  proofContract: 'deployed_proof_contract_address', 
  matchingContract: 'deployed_matching_contract_address'
};
```

## Troubleshooting

### Common Issues

1. **Proof server connection failed**
   - Ensure Docker container is running: `docker ps`
   - Check port mapping: `docker run -p 6300:6300 ...`
   - Verify server response: `curl http://localhost:6300`

2. **Compilation errors**
   - Check Compact language syntax
   - Verify all imports and dependencies
   - Ensure Midnight CLI is up to date

3. **Deployment failures**
   - Verify wallet has sufficient tDUST tokens
   - Check network connectivity to testnet
   - Ensure wallet address is correct

4. **Test failures**
   - Update contract addresses in test file
   - Verify proof server is accessible
   - Check test data validity

## Support

For issues and questions:
- Check the Midnight Network documentation
- Review the Compact language reference in `docs/reference/`
- Consult the CloakWork project documentation in `docs/CloakWork.md`

## License

This project is part of the CloakWork platform for the Midnight Network Hackathon.