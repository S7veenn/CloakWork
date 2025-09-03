// CloakWork Contracts Deployment Verification Test
// This script verifies that the deployed Task, Proof, and Matching contracts
// can be joined using the CloakWork CLI with the provided wallet.

const { spawnSync } = require('child_process');
const path = require('path');

// Wallet info (address for reference/logging)
const walletAddress = 'mn_shield-addr_test1c8aey7j2krmffd3vwnw25fmrkkygm78kedduwjtynvfpnmajhucqxqrmamtz5nrpxsca2pmqcy0sy6m2q4mryh9l3gy8c2l8ynl5hn3cwqsp9ply';
// Seed used for deployments (required so the same wallet is used for join)
const walletSeed = 'ac63f747cf761885e8a88e3352498a0f924e7d820d527b1a5da0f374eb36e95c';

// Deployed contract addresses
const taskContractAddress = '0200587ada3c64820dd8fa2c99f5eb922c5c14e48d5841d311470a6088bee55532cb';
const proofContractAddress = '0200f496d78785eefebc5f2be55cdacccc72687f7a50a676c10a570918518a2a1a3f';
const matchingContractAddress = '0200c975badb08d8e66b8f3da3462b1b713e03c0d09826cec128c6dc42718f15b951';

const cliCwd = path.resolve(__dirname, '../cloakwork-cli');

function runJoin(which, address) {
  console.log(`\n[Join] ${which} -> ${address}`);
  const res = spawnSync(
    process.execPath,
    [
      '--experimental-specifier-resolution=node',
      '--loader',
      'ts-node/esm',
      'src/testnet-remote.ts',
      'join',
      which,
      address,
      walletSeed,
    ],
    { cwd: cliCwd, encoding: 'utf-8' }
  );
  if (res.stdout) console.log(res.stdout.trim());
  if (res.stderr) console.error(res.stderr.trim());
  if (res.status !== 0) {
    const extra = res.error ? ` error=${res.error.message}` : '';
    const signal = res.signal ? ` signal=${res.signal}` : '';
    throw new Error(`Join ${which} failed with exit code ${res.status}${signal}${extra}`);
  }
}

function main() {
  console.log('CloakWork Deployment Verification Test');
  console.log(`Using wallet address: ${walletAddress}`);
  console.log('Verifying ability to join deployed contracts using the same wallet seed used for deployment...');

  runJoin('task', taskContractAddress);
  runJoin('proof', proofContractAddress);
  runJoin('matching', matchingContractAddress);

  console.log('\nAll contracts joined successfully. Deployment verification PASS.');
}

main();