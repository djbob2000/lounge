import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default async function globalSetup() {
  const thisFile = fileURLToPath(import.meta.url);
  const apiDir = resolve(thisFile, '../../api');
  try {
    execSync('pnpm prisma:seed', { cwd: apiDir, stdio: 'inherit' });
  } catch {}
}
