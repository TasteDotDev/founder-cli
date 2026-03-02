#!/usr/bin/env tsx
/**
 * Pre-bundles all skills data into a single JSON file for standalone binary builds.
 * Run before `bun build --compile` to embed skills data.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '..', '..', 'skills');
const OUT_FILE = join(__dirname, '..', 'src', 'skills', 'bundled-data.json');

interface BundledCategory {
  skill: string;
  frameworks: string | null;
}

const data: Record<string, BundledCategory> = {};

const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(SKILLS_DIR, d.name, 'SKILL.md')))
  .filter(d => d.name !== 'commands' && d.name !== '.claude-plugin');

for (const d of dirs) {
  const skillPath = join(SKILLS_DIR, d.name, 'SKILL.md');
  const fwPath = join(SKILLS_DIR, d.name, 'frameworks.md');

  data[d.name] = {
    skill: readFileSync(skillPath, 'utf-8'),
    frameworks: existsSync(fwPath) ? readFileSync(fwPath, 'utf-8') : null,
  };
}

writeFileSync(OUT_FILE, JSON.stringify(data));
console.log(`Bundled ${Object.keys(data).length} categories into ${OUT_FILE}`);
console.log(`Size: ${(readFileSync(OUT_FILE).length / 1024 / 1024).toFixed(1)} MB`);
