import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { setSkillsDir, resetSkillsDir } from '../src/skills/loader.js';

const SKILLS_DIR = join(__dirname, '..', '..', 'skills');

beforeAll(() => {
  setSkillsDir(SKILLS_DIR);
});

afterAll(() => {
  resetSkillsDir();
});

// Agent tests mock the LLM layer and test tool integration
describe('agent tools integration', () => {
  it('applyFramework tool returns framework content', async () => {
    const { applyFrameworkTool } = await import('../src/tools/apply-framework.js');
    const result = await applyFrameworkTool.execute(
      { category: 'strategy', framework: 'porters-five-forces' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.found).toBe(true);
    expect(result.content).toContain('Expert instructions');
  });

  it('applyFramework returns error for unknown framework', async () => {
    const { applyFrameworkTool } = await import('../src/tools/apply-framework.js');
    const result = await applyFrameworkTool.execute(
      { category: 'strategy', framework: 'nonexistent' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.found).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('listFrameworks tool returns categories', async () => {
    const { listFrameworksTool } = await import('../src/tools/list-frameworks.js');
    const result = await listFrameworksTool.execute(
      { category: undefined },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.categories).toBeDefined();
    expect(result.categories!.length).toBe(16);
    expect(result.totalFrameworks).toBeGreaterThan(500);
  });

  it('listFrameworks tool returns frameworks for a category', async () => {
    const { listFrameworksTool } = await import('../src/tools/list-frameworks.js');
    const result = await listFrameworksTool.execute(
      { category: 'strategy' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.frameworks).toBeDefined();
    expect(result.frameworks!.length).toBeGreaterThan(40);
  });

  it('listFrameworks returns error for unknown category', async () => {
    const { listFrameworksTool } = await import('../src/tools/list-frameworks.js');
    const result = await listFrameworksTool.execute(
      { category: 'nonexistent' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toBeTruthy();
  });
});
