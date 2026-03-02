import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const MEMORY_FILE = join(homedir(), '.config', 'founder', 'memory.json');

describe('saveNoteTool', () => {
  it('saves a session note', async () => {
    const { saveNoteTool } = await import('../src/tools/memory.js');
    const result = await saveNoteTool.execute(
      { key: 'test-key', content: 'test content', scope: 'session' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.saved).toBe(true);
    expect(result.key).toBe('test-key');
    expect(result.scope).toBe('session');
  });

  it('saves a global note', async () => {
    const { saveNoteTool } = await import('../src/tools/memory.js');
    const result = await saveNoteTool.execute(
      { key: 'global-key', content: 'global content', scope: 'global' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.saved).toBe(true);
    expect(result.scope).toBe('global');
  });
});

describe('recallNotesTool', () => {
  it('recalls saved notes', async () => {
    const { saveNoteTool, recallNotesTool } = await import('../src/tools/memory.js');

    // Save a note first
    await saveNoteTool.execute(
      { key: 'recall-test', content: 'recall content', scope: 'session' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );

    const result = await recallNotesTool.execute(
      {},
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.notes).toBeDefined();
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('returns both global and session notes', async () => {
    const { saveNoteTool, recallNotesTool } = await import('../src/tools/memory.js');

    await saveNoteTool.execute(
      { key: 'session-note', content: 'session data', scope: 'session' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    await saveNoteTool.execute(
      { key: 'global-note', content: 'global data', scope: 'global' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );

    const result = await recallNotesTool.execute(
      {},
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );

    const globalNotes = result.notes.filter((n: any) => n.scope === 'global');
    const sessionNotes = result.notes.filter((n: any) => n.scope === 'session');
    expect(globalNotes.length).toBeGreaterThan(0);
    expect(sessionNotes.length).toBeGreaterThan(0);
  });
});
