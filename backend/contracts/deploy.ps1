# Deployment Script for CloakWork Contracts to Midnight Testnet
# This script deploys all three contracts: Task, Proof, and Matching contracts

# Prerequisites:
# - Midnight CLI installed
# - Lace wallet with tDUST tokens
# - Proof server running on localhost:6300
# - Docker container with midnight-proof-server running

Write-Host "Starting CloakWork Contract Deployment..." -ForegroundColor Green

# Load configuration
$config = Get-Content "config.json" | ConvertFrom-Json

# Check if proof server is running
Write-Host "Checking proof server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:6300" -TimeoutSec 5
    Write-Host "Proof server is running: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Error: Proof server not accessible at localhost:6300" -ForegroundColor Red
    Write-Host "Please ensure Docker container is running with: docker run -d -p 6300:6300 --name midnight-proof-server midnightnetwork/proof-server:4.0.0" -ForegroundColor Yellow
    exit 1
}

# Step 1: Compile all contracts
Write-Host "Compiling contracts..." -ForegroundColor Yellow

$contracts = @(
    @{name="Task Contract"; file="task_contract.compact"; output="task_contract.wasm"},
    @{name="Proof Contract"; file="proof_contract.compact"; output="proof_contract.wasm"},
    @{name="Matching Contract"; file="matching_contract.compact"; output="matching_contract.wasm"}
)

foreach ($contract in $contracts) {
    Write-Host "Compiling $($contract.name)..." -ForegroundColor Cyan
    try {
        midnight compile $($contract.file) -o $($contract.output)
        Write-Host "✓ $($contract.name) compiled successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to compile $($contract.name): $_" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Deploy contracts in order
Write-Host "Deploying contracts to testnet..." -ForegroundColor Yellow
Write-Host "Note: Replace <your-wallet-address> with your actual Lace wallet address" -ForegroundColor Magenta

$walletAddress = Read-Host "Enter your wallet address (or press Enter to use placeholder)"
if ([string]::IsNullOrWhiteSpace($walletAddress)) {
    $walletAddress = "<your-wallet-address>"
    Write-Host "Using placeholder wallet address. Update before actual deployment." -ForegroundColor Yellow
}

foreach ($contract in $contracts) {
    Write-Host "Deploying $($contract.name)..." -ForegroundColor Cyan
    
    if ($walletAddress -eq "<your-wallet-address>") {
        Write-Host "Command to deploy $($contract.name):" -ForegroundColor Yellow
        Write-Host "midnight deploy $($contract.output) --wallet $walletAddress --network testnet" -ForegroundColor White
    } else {
        try {
            midnight deploy $($contract.output) --wallet $walletAddress --network testnet
            Write-Host "✓ $($contract.name) deployed successfully" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to deploy $($contract.name): $_" -ForegroundColor Red
            Write-Host "Ensure you have sufficient tDUST tokens from the faucet" -ForegroundColor Yellow
        }
    }
}

Write-Host "Deployment process completed!" -ForegroundColor Green
Write-Host "Remember to:" -ForegroundColor Yellow
Write-Host "1. Ensure you have tDUST tokens from the Midnight testnet faucet" -ForegroundColor White
Write-Host "2. Keep the proof server running during contract interactions" -ForegroundColor White
Write-Host "3. Update your frontend configuration with deployed contract addresses" -ForegroundColor White