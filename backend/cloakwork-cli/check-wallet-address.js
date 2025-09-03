import { buildWalletAndWaitForFunds } from './src/api.ts';
import { TestnetRemoteConfig } from './src/config.ts';
import { nativeToken } from '@midnight-ntwrk/ledger';
import * as Rx from 'rxjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Utility script to check wallet address from a given seed
 * Usage: node check-wallet-address.js [seed]
 * If no seed is provided, it will use the WALLET_SEED from .env
 */
async function checkWalletAddress() {
  try {
    // Get seed from command line argument or environment variable
    const seed = process.argv[2] || process.env.WALLET_SEED;
    
    if (!seed) {
      console.error('❌ No seed provided!');
      console.log('Usage: node check-wallet-address.js [seed]');
      console.log('Or set WALLET_SEED in your .env file');
      process.exit(1);
    }

    if (seed === 'your_wallet_seed_here') {
      console.error('❌ Please provide a real wallet seed, not the placeholder!');
      process.exit(1);
    }

    console.log('🔍 Checking wallet address for seed...');
    console.log('Seed:', seed.substring(0, 8) + '...' + seed.substring(seed.length - 8));
    console.log('=' .repeat(60));

    // Create config
    const config = new TestnetRemoteConfig();
    
    console.log('🏗️  Building wallet from seed...');
    
    // Build wallet from the provided seed
    const wallet = await buildWalletAndWaitForFunds(config, seed, ''); // empty filename = don't save state
    
    // Get wallet state to extract address and balance
    const state = await Rx.firstValueFrom(wallet.state());
    
    console.log('✅ Wallet built successfully!');
    console.log('📍 Wallet Address:', state.address);
    
    // Get current balance from state
    const balance = state.balances[nativeToken()] || 0n;
    console.log('💰 Current Balance:', balance.toString());
    
    console.log('=' .repeat(60));
    console.log('🎉 Address check completed!');
    
    // Clean up
    await wallet.close();
    
  } catch (error) {
    console.error('❌ Error checking wallet address:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid seed')) {
      console.log('\n💡 Make sure your seed is a valid 64-character hexadecimal string.');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Make sure Docker containers are running:');
      console.log('   docker-compose up -d');
    }
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

// Run the check
checkWalletAddress();