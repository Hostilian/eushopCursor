import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(
  path.join(dist, 'build.txt'),
  `api-server build marker — ${new Date().toISOString()}\nProduction bundle is produced in the deploy pipeline.\n`,
);

console.info('▸ Production build for the api server is performed in the deploy pipeline.');
