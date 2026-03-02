import { describe, it, expect } from 'vitest';

describe('listDirectoryTool', () => {
  it('lists the current directory', async () => {
    const { listDirectoryTool } = await import('../src/tools/filesystem.js');
    const result = await listDirectoryTool.execute(
      { path: '.' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.items).toBeDefined();
    expect(result.items!.length).toBeGreaterThan(0);
    // Should find package.json in the cli directory
    const packageJson = result.items!.find((i: any) => i.name === 'package.json');
    expect(packageJson).toBeDefined();
    expect(packageJson!.type).toBe('file');
  });

  it('lists a subdirectory', async () => {
    const { listDirectoryTool } = await import('../src/tools/filesystem.js');
    const result = await listDirectoryTool.execute(
      { path: 'src' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.items).toBeDefined();
    const indexTs = result.items!.find((i: any) => i.name === 'index.ts');
    expect(indexTs).toBeDefined();
  });

  it('returns error for nonexistent directory', async () => {
    const { listDirectoryTool } = await import('../src/tools/filesystem.js');
    const result = await listDirectoryTool.execute(
      { path: 'nonexistent-dir' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toBeDefined();
  });

  it('prevents path traversal outside cwd', async () => {
    const { listDirectoryTool } = await import('../src/tools/filesystem.js');
    const result = await listDirectoryTool.execute(
      { path: '../../..' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('current working directory');
  });

  it('filters hidden files', async () => {
    const { listDirectoryTool } = await import('../src/tools/filesystem.js');
    const result = await listDirectoryTool.execute(
      { path: '.' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    const hidden = result.items!.filter((i: any) => i.name.startsWith('.') && i.name !== '.env.example');
    expect(hidden.length).toBe(0);
  });
});

describe('readFileTool', () => {
  it('reads a file', async () => {
    const { readFileTool } = await import('../src/tools/filesystem.js');
    const result = await readFileTool.execute(
      { path: 'package.json' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.content).toContain('@taste.dev/founder');
  });

  it('returns error for nonexistent file', async () => {
    const { readFileTool } = await import('../src/tools/filesystem.js');
    const result = await readFileTool.execute(
      { path: 'nonexistent-file.txt' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toBeDefined();
  });

  it('returns error when trying to read a directory', async () => {
    const { readFileTool } = await import('../src/tools/filesystem.js');
    const result = await readFileTool.execute(
      { path: 'src' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('directory');
  });

  it('prevents path traversal', async () => {
    const { readFileTool } = await import('../src/tools/filesystem.js');
    const result = await readFileTool.execute(
      { path: '../../../etc/passwd' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('current working directory');
  });
});
