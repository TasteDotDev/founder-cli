import { streamText } from 'ai';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Config } from './config.js';
import { getModel } from './providers.js';
import { buildSystemPrompt } from './skills/router.js';
import { applyFrameworkTool } from './tools/apply-framework.js';
import { listFrameworksTool } from './tools/list-frameworks.js';
import { webSearchTool, readWebPageTool } from './tools/web-search.js';
import { listDirectoryTool, readFileTool } from './tools/filesystem.js';
import { saveNoteTool, recallNotesTool } from './tools/memory.js';

export type AgentEvent =
  | { type: 'model'; provider: string; modelId: string }
  | { type: 'status'; text: string }
  | { type: 'chunk'; text: string }
  | { type: 'done'; usage: { promptTokens: number; completionTokens: number }; frameworkCount: number; searchCount: number; fileCount: number }
  | { type: 'error'; message: string };

export interface StreamAgentOptions {
  config: Config;
  input: string;
  category?: string;
  framework?: string;
  allowFileAccess?: boolean;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function toolStatusText(toolName: string, args: any): string {
  switch (toolName) {
    case 'applyFramework': return `Applying ${args.framework}...`;
    case 'listFrameworks': return 'Browsing frameworks...';
    case 'webSearch': return `Searching: ${args.query}`;
    case 'readWebPage': return 'Reading web page...';
    case 'readFile': return `Reading ${args.path}...`;
    case 'listDirectory': return `Exploring ${args.path || '.'}...`;
    case 'saveNote': return 'Saving note...';
    case 'recallNotes': return 'Recalling notes...';
    default: return 'Thinking...';
  }
}

export async function* streamAgent(options: StreamAgentOptions): AsyncGenerator<AgentEvent> {
  const { config, input, category, framework, allowFileAccess, history = [] } = options;

  let modelId: string;
  let model: any;
  try {
    const result = await getModel(config);
    model = result.model;
    modelId = result.modelId;
  } catch (e: any) {
    yield { type: 'error', message: `Failed to initialize model: ${e.message}` };
    return;
  }

  yield { type: 'model', provider: config.provider, modelId };

  const systemPrompt = buildSystemPrompt({ category, framework });

  const tools: Record<string, any> = {
    applyFramework: applyFrameworkTool,
    listFrameworks: listFrameworksTool,
    webSearch: webSearchTool,
    readWebPage: readWebPageTool,
    saveNote: saveNoteTool,
    recallNotes: recallNotesTool,
  };

  if (allowFileAccess) {
    tools.listDirectory = listDirectoryTool;
    tools.readFile = readFileTool;
  }

  yield { type: 'status', text: 'Thinking...' };

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: [...history, { role: 'user' as const, content: input }],
      tools,
      maxSteps: 15,
    });

    // Use fullStream to get both text chunks and tool call status updates
    for await (const part of result.fullStream) {
      if (part.type === 'text-delta') {
        yield { type: 'chunk', text: part.textDelta };
      } else if (part.type === 'tool-call') {
        yield { type: 'status', text: toolStatusText(part.toolName, part.args) };
      } else if (part.type === 'step-finish') {
        // After a tool step, model starts thinking again
        yield { type: 'status', text: 'Thinking...' };
      }
    }

    const usage = await result.usage;
    const steps = await result.steps;

    let frameworkCount = 0;
    let searchCount = 0;
    let fileCount = 0;
    for (const s of steps) {
      for (const tc of s.toolCalls ?? []) {
        if (tc.toolName === 'applyFramework') frameworkCount++;
        else if (tc.toolName === 'webSearch') searchCount++;
        else if (tc.toolName === 'readFile' || tc.toolName === 'listDirectory') fileCount++;
      }
    }

    yield {
      type: 'done',
      usage: { promptTokens: usage.promptTokens, completionTokens: usage.completionTokens },
      frameworkCount,
      searchCount,
      fileCount,
    };
  } catch (e: any) {
    const msg = e.message ?? String(e);
    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('invalid_api_key')) {
      yield { type: 'error', message: 'Invalid API key. Run `founder config setup` to reconfigure.' };
    } else if (msg.includes('429') || msg.includes('rate_limit')) {
      yield { type: 'error', message: 'Rate limited. Wait a moment and try again.' };
    } else if (msg.includes('thought_signature') || msg.includes('INVALID_ARGUMENT')) {
      yield { type: 'error', message: "This model doesn't support tool calling properly. Try: `founder config set model gemini-2.5-flash`" };
    } else {
      yield { type: 'error', message: msg };
    }
  }
}
