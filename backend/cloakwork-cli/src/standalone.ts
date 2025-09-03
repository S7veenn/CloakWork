import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const composeFile = join(projectRoot, 'standalone.yml');

function run(cmd: string, inherit = true): string {
  const options: any = { cwd: projectRoot };
  if (inherit) options.stdio = 'inherit';
  const res = execSync(cmd, options);
  return res ? res.toString().trim() : '';
}

function compose(args: string): string {
  // Quote the compose file path to be safe on Windows paths with spaces
  return `docker compose -f "${composeFile}" ${args}`;
}

function getMappedPort(service: string, containerPort: number): string | null {
  try {
    const out = run(compose(`port ${service} ${containerPort}`), false);
    return out || null; // e.g., returns '127.0.0.1:12345'
  } catch (e) {
    return null;
  }
}

console.log('Starting CloakWork standalone stack (node, indexer, proof-server)...');
run(compose('up -d'));

// Give containers a brief moment to initialize networking
setTimeout(() => {
  const nodePort = getMappedPort('node', 9944);
  const indexerPort = getMappedPort('indexer', 8088);
  const proofServerPort = getMappedPort('proof-server', 6300);

  console.log('\nCloakWork stack is starting. Here are the mapped endpoints:');
  if (nodePort) {
    console.log(`- Midnight node WS: ws://${nodePort}`);
    console.log(`  Healthcheck: http://${nodePort}/health`);
  } else {
    console.log('- Midnight node port not yet available. It may take a few seconds.');
  }

  if (indexerPort) {
    console.log(`- Indexer HTTP: http://${indexerPort}`);
  } else {
    console.log('- Indexer port not yet available. It may take a few seconds.');
  }

  if (proofServerPort) {
    console.log(`- Proof server HTTP: http://${proofServerPort}`);
  } else {
    console.log('- Proof server port not yet available. It may take a few seconds.');
  }

  console.log('\nUse the following commands to manage the stack:');
  console.log('  npm run standalone:down   # Stop and remove containers');
  console.log('  npm run standalone:up     # Start containers in the background');
}, 1500);