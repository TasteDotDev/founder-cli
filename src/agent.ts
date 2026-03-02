import { streamText } from 'ai';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Config } from './config.js';
import { getModel } from './providers.js';
import { buildSystemPrompt } from './skills/router.js';
import { renderMarkdown, initMarkdown } from './ui/output.js';
import { applyFrameworkTool } from './tools/apply-framework.js';
import { listFrameworksTool } from './tools/list-frameworks.js';
import { webSearchTool, readWebPageTool } from './tools/web-search.js';
import { listDirectoryTool, readFileTool } from './tools/filesystem.js';
import { saveNoteTool, recallNotesTool } from './tools/memory.js';

export interface AgentOptions {
  config: Config;
  input: string;
  category?: string;
  framework?: string;
  allowFileAccess?: boolean;
}

function formatTokens(n: number): string {
  if (isNaN(n) || n === 0) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/**
 * Detect if we're inside a project directory.
 */
function detectProject(): boolean {
  const markers = ['package.json', 'Cargo.toml', 'pyproject.toml', 'go.mod', 'Gemfile', 'pom.xml', 'build.gradle', '.git', 'README.md'];
  return markers.some((m) => existsSync(join(process.cwd(), m)));
}

export async function runAgent(options: AgentOptions): Promise<void> {
  const { config, input, category, framework, allowFileAccess } = options;

  await initMarkdown();

  let modelId: string;
  let model: any;
  try {
    const result = await getModel(config);
    model = result.model;
    modelId = result.modelId;
  } catch (e: any) {
    console.error(chalk.red(`Failed to initialize model: ${e.message}`));
    console.error(chalk.dim('Run `founder config setup` to reconfigure.'));
    process.exit(1);
  }

  // Show model info
  console.log(chalk.dim(`  ${config.provider}/${modelId}`));

  const systemPrompt = buildSystemPrompt({ category, framework });

  // Build tools — always include frameworks + web + memory, conditionally include filesystem
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
    console.log(chalk.dim(`  project: ${process.cwd()}`));
  }

  const spinner = ora({
    text: 'Thinking...',
    color: 'cyan',
    spinner: 'dots',
    discardStdin: false,
  }).start();

  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: input }],
      tools,
      maxSteps: 15,
      onStepFinish({ toolCalls }) {
        if (toolCalls && toolCalls.length > 0) {
          for (const tc of toolCalls) {
            if (tc.toolName === 'applyFramework') {
              const args = tc.args as { category: string; framework: string };
              spinner.text = `Applying ${args.framework}...`;
            } else if (tc.toolName === 'listFrameworks') {
              spinner.text = 'Browsing frameworks...';
            } else if (tc.toolName === 'webSearch') {
              const args = tc.args as { query: string };
              spinner.text = `Searching: ${args.query}`;
            } else if (tc.toolName === 'readWebPage') {
              spinner.text = 'Reading web page...';
            } else if (tc.toolName === 'readFile') {
              const args = tc.args as { path: string };
              spinner.text = `Reading ${args.path}...`;
            } else if (tc.toolName === 'listDirectory') {
              const args = tc.args as { path: string };
              spinner.text = `Exploring ${args.path || '.'}...`;
            } else if (tc.toolName === 'saveNote') {
              spinner.text = 'Saving note...';
            } else if (tc.toolName === 'recallNotes') {
              spinner.text = 'Recalling notes...';
            }
          }
          // Restart spinner for next thinking step
          if (!spinner.isSpinning) spinner.start('Thinking...');
        }
      },
    });

    let fullText = '';

    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    spinner.stop();

    // Render with colorful markdown
    if (fullText.trim()) {
      process.stdout.write(renderMarkdown(fullText));
    }

    // Show usage stats
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

    const parts: string[] = [];
    if (usage.promptTokens || usage.completionTokens) {
      parts.push(`${formatTokens(usage.promptTokens)} in → ${formatTokens(usage.completionTokens)} out`);
    }
    if (frameworkCount > 0) {
      parts.push(`${frameworkCount} framework${frameworkCount === 1 ? '' : 's'}`);
    }
    if (searchCount > 0) {
      parts.push(`${searchCount} search${searchCount === 1 ? '' : 'es'}`);
    }
    if (fileCount > 0) {
      parts.push(`${fileCount} file${fileCount === 1 ? '' : 's'} read`);
    }
    if (parts.length > 0) {
      console.log(chalk.dim(`\n  ${parts.join('  ·  ')}`));
    }
  } catch (e: any) {
    spinner.stop();
    const msg = e.message ?? String(e);

    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('invalid_api_key')) {
      console.error(chalk.red('\nInvalid API key.'));
      console.error(chalk.dim('Run `founder config setup` to reconfigure.'));
    } else if (msg.includes('429') || msg.includes('rate_limit')) {
      console.error(chalk.red('\nRate limited. Wait a moment and try again.'));
    } else if (msg.includes('thought_signature') || msg.includes('INVALID_ARGUMENT')) {
      console.error(chalk.red(`\nThis model doesn't support tool calling properly.`));
      console.error(chalk.dim('Try a different model: `founder config set model gemini-2.5-flash`'));
    } else {
      console.error(chalk.red(`\nError: ${msg}`));
    }
  }
}
