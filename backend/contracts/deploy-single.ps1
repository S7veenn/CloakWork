param(
    [string]$ContractFile = "task_contract.compact",
    [string]$WalletAddress = "mn_shield-addr_test1c8aey7j2krmffd3vwnw25fmrkkygm78kedduwjtynvfpnmajhucqxqrmamtz5nrpxsca2pmqcy0sy6m2q4mryh9l3gy8c2l8ynl5hn3cwqsp9ply",
    [string]$Network = "testnet",
    [string]$ProofServer = "http://localhost:6300"
)

Write-Host "=== CloakWork: Single Contract Deploy ===" -ForegroundColor Green

# Ensure we are running from the contracts directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Ask for wallet address if not provided
if ([string]::IsNullOrWhiteSpace($WalletAddress)) {
    $WalletAddress = Read-Host "Enter your wallet address (Lace / Midnight wallet)"
}

if ([string]::IsNullOrWhiteSpace($WalletAddress)) {
    Write-Host "A wallet address is required to deploy. Aborting." -ForegroundColor Red
    exit 1
}

# Quick proof server check (not strictly required for deploy, but helpful)
Write-Host "Checking proof server at $ProofServer ..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri $ProofServer -TimeoutSec 5
    if ($resp.StatusCode -eq 200) {
        Write-Host "Proof server OK: $($resp.Content)" -ForegroundColor Green
    } else {
        Write-Host "Proof server responded with status $($resp.StatusCode). Continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not reach proof server at $ProofServer. Continuing with deploy." -ForegroundColor Yellow
}

# Determine output wasm file
$wasmOut = [System.IO.Path]::ChangeExtension($ContractFile, ".wasm")

# Compile
Write-Host "Compiling $ContractFile -> $wasmOut" -ForegroundColor Cyan
try {
    midnight compile $ContractFile -o $wasmOut
    Write-Host "✓ Compile success" -ForegroundColor Green
} catch {
    Write-Host "✗ Compile failed: $_" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "Deploying $wasmOut to $Network from wallet $WalletAddress" -ForegroundColor Cyan
try {
    $deployOutput = midnight deploy $wasmOut --wallet $WalletAddress --network $Network 2>&1
    Write-Host $deployOutput
    Write-Host "✓ Deploy command finished" -ForegroundColor Green
} catch {
    Write-Host "✗ Deploy failed: $_" -ForegroundColor Red
    Write-Host "Hint: Ensure you have tDUST on $Network and the wallet address is correct." -ForegroundColor Yellow
    exit 1
}

Write-Host "Done." -ForegroundColor Green