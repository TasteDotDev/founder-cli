import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { buildSystemPrompt } from '../src/skills/router.js';
import { setSkillsDir, resetSkillsDir } from '../src/skills/loader.js';

const SKILLS_DIR = join(__dirname, '..', '..', 'skills');

beforeAll(() => {
  setSkillsDir(SKILLS_DIR);
});

afterAll(() => {
  resetSkillsDir();
});

describe('buildSystemPrompt', () => {
  it('builds founder prompt by default', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('support the user\'s thinking');
    expect(prompt).toContain('Tool usage');
    expect(prompt).toContain('applyFramework');
  });

  it('does not contain Claude-specific references', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).not.toContain('Skill tool');
    expect(prompt).not.toContain('`/strategy`');
  });

  it('builds category prompt', () => {
    const prompt = buildSystemPrompt({ category: 'strategy' });
    expect(prompt).toContain('Strategy');
    expect(prompt).toContain('Tool usage');
  });

  it('builds framework prompt', () => {
    const prompt = buildSystemPrompt({ framework: 'porters-five-forces' });
    expect(prompt).toBeTruthy();
    expect(prompt).toContain('Apply this framework fully');
  });

  it('throws for unknown framework', () => {
    expect(() => buildSystemPrompt({ framework: 'nonexistent' })).toThrow();
  });
});
