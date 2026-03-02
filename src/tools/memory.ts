import { tool } from 'ai';
import { z } from 'zod';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Session memory — persists to ~/.config/founder/memory.json
 * Each session has its own namespace, but the agent can also read across sessions.
 */

const MEMORY_DIR = join(homedir(), '.config', 'founder');
const MEMORY_FILE = join(MEMORY_DIR, 'memory.json');

interface MemoryStore {
  sessions: Record<string, Record<string, string>>;
  global: Record<string, string>;
}

function loadMemory(): MemoryStore {
  try {
    if (existsSync(MEMORY_FILE)) {
      return JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
    }
  } catch {}
  return { sessions: {}, global: {} };
}

function saveMemory(store: MemoryStore): void {
  try {
    mkdirSync(MEMORY_DIR, { recursive: true });
    writeFileSync(MEMORY_FILE, JSON.stringify(store, null, 2));
  } catch {}
}

// Generate a session ID based on date + cwd
const SESSION_ID = `${new Date().toISOString().slice(0, 10)}_${process.cwd().split('/').pop()}`;

export const saveNoteTool = tool({
  description:
    'Save a note to memory. Use this to remember key facts about the user, their business, preferences, and insights. Notes persist across sessions. Use scope "session" for current-conversation context, or "global" for long-term user facts.',
  parameters: z.object({
    key: z
      .string()
      .describe('Topic key (e.g. "business-model", "key-challenge", "target-market", "user-tone", "company-name")'),
    content: z
      .string()
      .describe('The note content to save'),
    scope: z
      .enum(['session', 'global'])
      .default('session')
      .describe('"session" for this conversation, "global" for permanent user facts'),
  }),
  execute: async ({ key, content, scope }) => {
    const store = loadMemory();
    if (scope === 'global') {
      store.global[key] = content;
    } else {
      if (!store.sessions[SESSION_ID]) store.sessions[SESSION_ID] = {};
      store.sessions[SESSION_ID][key] = content;
    }
    saveMemory(store);
    return { saved: true, key, scope };
  },
});

export const recallNotesTool = tool({
  description:
    'Recall saved notes from memory. Returns both global (long-term) notes and current session notes. Use this at the start of a conversation to remember what you know about the user.',
  parameters: z.object({}),
  execute: async () => {
    const store = loadMemory();
    const global = Object.entries(store.global).map(([key, content]) => ({ key, content, scope: 'global' as const }));
    const session = Object.entries(store.sessions[SESSION_ID] ?? {}).map(([key, content]) => ({ key, content, scope: 'session' as const }));

    // Also include recent sessions for context
    const recentSessions = Object.keys(store.sessions)
      .filter((id) => id !== SESSION_ID)
      .sort()
      .slice(-3);

    const recent = recentSessions.flatMap((id) =>
      Object.entries(store.sessions[id]).map(([key, content]) => ({
        key: `[${id}] ${key}`,
        content,
        scope: 'past-session' as const,
      }))
    );

    const notes = [...global, ...session, ...recent];

    if (notes.length === 0) {
      return { notes: [], message: 'No notes saved yet. This is a new user.' };
    }

    return { notes };
  },
});
