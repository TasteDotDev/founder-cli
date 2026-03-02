import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';

const SKILLS_REPO = 'TasteDotDev/founder-skills';
const TARBALL_URL = `https://github.com/${SKILLS_REPO}/archive/refs/heads/main.tar.gz`;
const API_URL = `https://api.github.com/repos/${SKILLS_REPO}/commits/main`;
const FOUNDER_DIR = join(homedir(), '.founder');
const SKILLS_DIR = join(FOUNDER_DIR, 'skills');
const META_FILE = join(FOUNDER_DIR, 'skills-meta.json');
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SkillsMeta {
  sha?: string;
  updatedAt: string;
  lastCheck: number;
}

function readMeta(): SkillsMeta | null {
  try {
    return JSON.parse(readFileSync(META_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function writeMeta(meta: SkillsMeta): void {
  mkdirSync(FOUNDER_DIR, { recursive: true });
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

/** Returns ~/.founder/skills if it exists and has valid content */
export function getDownloadedSkillsDir(): string | null {
  if (existsSync(join(SKILLS_DIR, 'founder', 'SKILL.md'))) {
    return SKILLS_DIR;
  }
  return null;
}

/**
 * Ensure skills are available locally. Downloads if missing.
 * Triggers a non-blocking background update check if skills exist.
 */
export async function ensureSkills(): Promise<string> {
  const existing = getDownloadedSkillsDir();
  if (existing) {
    // Non-blocking background update check
    checkForSkillsUpdate().catch(() => {});
    return existing;
  }

  console.log(chalk.dim('Downloading skills library...'));
  const dir = await downloadSkills();
  console.log(chalk.dim('Skills downloaded.\n'));
  return dir;
}

async function downloadSkills(): Promise<string> {
  const tmpFile = join(tmpdir(), `founder-skills-${Date.now()}.tar.gz`);
  const tmpExtract = join(tmpdir(), `founder-skills-${Date.now()}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(TARBALL_URL, {
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(tmpFile, buffer);

    // Extract tarball
    mkdirSync(tmpExtract, { recursive: true });
    execSync(`tar xzf "${tmpFile}" -C "${tmpExtract}"`, { stdio: 'pipe' });

    // Find extracted dir (founder-skills-main/ or similar)
    const extracted = readdirSync(tmpExtract).find(d => d.startsWith('founder-skills') || d.startsWith('FounderSkills'));
    if (!extracted) throw new Error('Invalid tarball structure');

    const srcSkills = join(tmpExtract, extracted, 'skills');
    if (!existsSync(join(srcSkills, 'founder', 'SKILL.md'))) {
      throw new Error('skills/founder/SKILL.md not found in tarball');
    }

    // Replace ~/.founder/skills/
    mkdirSync(FOUNDER_DIR, { recursive: true });
    if (existsSync(SKILLS_DIR)) rmSync(SKILLS_DIR, { recursive: true });

    // Use cp -r (works on macOS/Linux/Windows 10+)
    execSync(`cp -r "${srcSkills}" "${SKILLS_DIR}"`, { stdio: 'pipe' });

    writeMeta({ updatedAt: new Date().toISOString(), lastCheck: Date.now() });

    return SKILLS_DIR;
  } finally {
    try { rmSync(tmpFile, { force: true }); } catch {}
    try { rmSync(tmpExtract, { recursive: true, force: true }); } catch {}
  }
}

/** Background check for skills updates (non-blocking) */
async function checkForSkillsUpdate(): Promise<void> {
  const meta = readMeta();
  if (meta && Date.now() - meta.lastCheck < CHECK_INTERVAL_MS) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    clearTimeout(timeout);

    if (!res.ok) return;

    const data = (await res.json()) as { sha?: string };
    const latestSha = data.sha;

    // Update last check time
    const currentMeta = readMeta();
    writeMeta({
      sha: currentMeta?.sha,
      updatedAt: currentMeta?.updatedAt ?? new Date().toISOString(),
      lastCheck: Date.now(),
    });

    // If we have a cached SHA and it's different, update in background
    if (latestSha && currentMeta?.sha && latestSha !== currentMeta.sha) {
      await downloadSkills();
    } else if (latestSha && !currentMeta?.sha) {
      // First time we got SHA — just record it
      writeMeta({
        sha: latestSha,
        updatedAt: currentMeta?.updatedAt ?? new Date().toISOString(),
        lastCheck: Date.now(),
      });
    }
  } catch {
    // Silently ignore — non-blocking check
  }
}

/** Force re-download of skills (for manual update command) */
export async function forceUpdateSkills(): Promise<void> {
  console.log(chalk.dim('Updating skills library...'));
  await downloadSkills();
  console.log(chalk.green('Skills updated to latest.'));
}
