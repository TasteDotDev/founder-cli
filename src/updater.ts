import chalk from 'chalk';
import { execSync } from 'child_process';
import { VERSION, PACKAGE_NAME } from './version.js';

const REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let lastCheckTime = 0;

export async function checkForUpdate(): Promise<void> {
  const now = Date.now();
  if (now - lastCheckTime < CHECK_INTERVAL_MS) return;
  lastCheckTime = now;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(REGISTRY_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return;

    const data = (await res.json()) as { version?: string };
    const latest = data.version;
    if (!latest) return;

    if (latest !== VERSION && isNewer(latest, VERSION)) {
      console.log(
        chalk.yellow(
          `\nUpdate available: ${VERSION} → ${latest}  Run: ${chalk.cyan('founder update')}\n`
        )
      );
    }
  } catch {
    // Silently ignore — non-blocking check
  }
}

function isNewer(latest: string, current: string): boolean {
  const l = latest.split('.').map(Number);
  const c = current.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

export async function runUpdate(): Promise<void> {
  console.log(chalk.dim('Checking for updates...'));

  try {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) {
      console.error(chalk.red('Failed to check for updates.'));
      return;
    }

    const data = (await res.json()) as { version?: string };
    const latest = data.version;

    if (!latest || latest === VERSION) {
      console.log(chalk.green(`Already on the latest version (${VERSION}).`));
      return;
    }

    console.log(chalk.dim(`Updating ${VERSION} → ${latest}...`));

    // Detect install method and run appropriate update
    const updateCmd = detectUpdateCommand();
    console.log(chalk.dim(`Running: ${updateCmd}`));
    execSync(updateCmd, { stdio: 'inherit' });

    console.log(chalk.green(`Updated to ${latest}!`));
  } catch (e: any) {
    console.error(chalk.red(`Update failed: ${e.message}`));
    console.error(chalk.dim(`Try manually: npm i -g ${PACKAGE_NAME}`));
  }
}

function detectUpdateCommand(): string {
  // Check if installed via bun
  try {
    const bunGlobalDir = execSync('bun pm ls -g 2>/dev/null', { encoding: 'utf-8' });
    if (bunGlobalDir.includes(PACKAGE_NAME)) {
      return `bun add -g ${PACKAGE_NAME}@latest`;
    }
  } catch {}

  // Default to npm
  return `npm i -g ${PACKAGE_NAME}@latest`;
}
