#!/usr/bin/env node
import pino from 'pino';
import { TestnetRemoteConfig } from './config';
import { buildFreshWallet, buildWalletAndWaitForFunds, configureMatchingProviders, configureProofProviders, configureTaskProviders, deployMatchingContract, deployProofContract, deployTaskContract, joinMatchingContract, joinProofContract, joinTaskContract, randomBytes, setLogger, } from './api';
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
setLogger(logger);
function usage() {
    console.log(`\nCloakWork CLI (testnet-remote)\n\nUsage:\n  npm run testnet-remote -- <command> [options]\n\nCommands:\n  deploy <task|proof|matching> [seed]\n      Deploys a contract with a fresh or provided seed and prints its address.\n\n  join <task|proof|matching> <address> [seed]\n      Joins an existing deployed contract at <address>.\n\nExamples:\n  npm run testnet-remote -- deploy task\n  npm run testnet-remote -- deploy proof 0123abcd...seed\n  npm run testnet-remote -- join matching 0x1234...deadbeef\n`);
    process.exit(1);
}
const main = async () => {
    const args = process.argv.slice(2);
    if (args.length < 1)
        usage();
    const cfg = new TestnetRemoteConfig();
    const cmd = args[0];
    if (cmd === 'deploy') {
        const which = args[1];
        const seed = args[2];
        if (!which || !['task', 'proof', 'matching'].includes(which))
            usage();
        const wallet = seed
            ? await buildWalletAndWaitForFunds(cfg, seed, '')
            : await buildFreshWallet(cfg);
        try {
            if (which === 'task') {
                const providers = await configureTaskProviders(wallet, cfg);
                const privateState = {
                    requirementsCommitment: randomBytes(32),
                    creatorSecret: randomBytes(32),
                };
                const contractInfo = await deployTaskContract(providers, privateState);
                logger.info(`Task contract deployed at address: ${contractInfo.deployTxData.public.contractAddress}`);
            }
            else if (which === 'proof') {
                const providers = await configureProofProviders(wallet, cfg);
                const privateState = {
                    submitterSecret: randomBytes(32),
                    proofCommitment: randomBytes(32),
                    taskSecret: randomBytes(32),
                };
                const contractInfo = await deployProofContract(providers, privateState);
                logger.info(`Proof contract deployed at address: ${contractInfo.deployTxData.public.contractAddress}`);
            }
            else if (which === 'matching') {
                const providers = await configureMatchingProviders(wallet, cfg);
                const privateState = {
                    taskSecret: randomBytes(32),
                    ownerSecret: randomBytes(32),
                    contributorSecret: randomBytes(32),
                    proofSecret: randomBytes(32),
                };
                const contractInfo = await deployMatchingContract(providers, privateState);
                logger.info(`Matching contract deployed at address: ${contractInfo.deployTxData.public.contractAddress}`);
            }
        }
        finally {
            // Ensure wallet resources are released
            if ('stop' in wallet && typeof wallet.stop === 'function') {
                await wallet.stop();
            }
        }
    }
    else if (cmd === 'join') {
        const which = args[1];
        const address = args[2];
        const seed = args[3];
        if (!which || !['task', 'proof', 'matching'].includes(which))
            usage();
        if (!address)
            usage();
        const wallet = seed
            ? await buildWalletAndWaitForFunds(cfg, seed, '')
            : await buildFreshWallet(cfg);
        try {
            if (which === 'task') {
                const providers = await configureTaskProviders(wallet, cfg);
                const handle = await joinTaskContract(providers, address);
                logger.info({ address: handle.deployTxData.public.contractAddress }, 'Joined Task contract');
            }
            else if (which === 'proof') {
                const providers = await configureProofProviders(wallet, cfg);
                const handle = await joinProofContract(providers, address);
                logger.info({ address: handle.deployTxData.public.contractAddress }, 'Joined Proof contract');
            }
            else if (which === 'matching') {
                const providers = await configureMatchingProviders(wallet, cfg);
                const handle = await joinMatchingContract(providers, address);
                logger.info({ address: handle.deployTxData.public.contractAddress }, 'Joined Matching contract');
            }
        }
        finally {
            if ('stop' in wallet && typeof wallet.stop === 'function') {
                await wallet.stop();
            }
        }
    }
    else {
        usage();
    }
};
main().catch((err) => {
    logger.error(err, 'CLI failed');
    process.exit(1);
});
//# sourceMappingURL=testnet-remote.js.map