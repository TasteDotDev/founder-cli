import { tool } from 'ai';
import { z } from 'zod';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const cwd = process.cwd();

/**
 * Resolve a path safely — must stay within the current working directory.
 */
function safePath(inputPath: string): string {
  const resolved = resolve(cwd, inputPath);
  if (!resolved.startsWith(cwd)) {
    throw new Error('Path must be within the current working directory');
  }
  return resolved;
}

export const listDirectoryTool = tool({
  description:
    "List files and directories in the user's project. Use this to understand what the user is working on — look at their project structure, find key files like package.json, README, config files, etc.",
  parameters: z.object({
    path: z
      .string()
      .default('.')
      .describe('Relative path from the current directory (default: ".")'),
  }),
  execute: async ({ path }) => {
    try {
      const resolved = safePath(path);
      const entries = readdirSync(resolved, { withFileTypes: true });

      const items = entries
        .filter((e) => !e.name.startsWith('.') || e.name === '.env.example')
        .slice(0, 100) // cap at 100 entries
        .map((e) => {
          const type = e.isDirectory() ? 'dir' : 'file';
          let size: string | undefined;
          if (e.isFile()) {
            try {
              const s = statSync(join(resolved, e.name));
              size = s.size < 1024 ? `${s.size}B` : `${(s.size / 1024).toFixed(1)}KB`;
            } catch {}
          }
          return { name: e.name, type, size };
        });

      return { path, items };
    } catch (e: any) {
      return { error: `Cannot list directory: ${e.message}` };
    }
  },
});

export const readFileTool = tool({
  description:
    "Read a file from the user's project. Use this to understand their codebase, business context, README, config, or any relevant file. Read package.json, README.md, and key source files to understand what they're building.",
  parameters: z.object({
    path: z
      .string()
      .describe('Relative path to the file (e.g. "package.json", "src/index.ts", "README.md")'),
  }),
  execute: async ({ path }) => {
    try {
      const resolved = safePath(path);
      const stat = statSync(resolved);

      if (stat.isDirectory()) {
        return { error: `"${path}" is a directory. Use listDirectory instead.` };
      }

      // Skip binary/large files
      if (stat.size > 100_000) {
        return {
          path,
          truncated: true,
          content: readFileSync(resolved, 'utf-8').slice(0, 100_000) + '\n\n[... truncated at 100KB]',
        };
      }

      const content = readFileSync(resolved, 'utf-8');
      return { path, content };
    } catch (e: any) {
      return { error: `Cannot read file: ${e.message}` };
    }
  },
});
