import { Command } from 'commander';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { getConfig, isConfigured, setConfig, showConfig } from './config.js';
import { runAgent } from './agent.js';
import { getAllCategories, getCategoryFrameworks } from './skills/loader.js';
import { DEFAULT_MODELS, RECOMMENDED_MODELS } from './providers.js';
import { runSetup } from './ui/setup.js';
import { checkForUpdate, runUpdate } from './updater.js';
import { VERSION } from './version.js';
import { handleCompletions, generateBashCompletion, generateZshCompletion, generateFishCompletion } from './completion.js';
import { startRepl } from './ui/repl.js';
import { ensureSkills, forceUpdateSkills } from './skills/sync.js';

function detectProject(): boolean {
  const markers = ['package.json', 'Cargo.toml', 'pyproject.toml', 'go.mod', 'Gemfile', 'pom.xml', 'build.gradle', '.git', 'README.md'];
  return markers.some((m) => existsSync(join(process.cwd(), m)));
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('founder')
    .description('Business consultant in your terminal — 568 frameworks, any LLM')
    .version(VERSION)
    .argument('[input...]', 'Describe your business problem')
    .option('-c, --category <category>', 'Use a specific category')
    .option('-f, --framework <framework>', 'Use a specific framework')
    .action(async (inputParts: string[], opts) => {
      const input = inputParts.join(' ');
      if (!input) {
        await startRepl();
        return;
      }

      if (!isConfigured()) {
        await runSetup();
      }

      await ensureSkills();

      const config = getConfig();
      const allowFileAccess = detectProject();
      await runAgent({
        config,
        input,
        category: opts.category,
        framework: opts.framework,
        allowFileAccess,
      });
    });

  program
    .command('list [category]')
    .description('List categories or frameworks in a category')
    .action(async (category?: string) => {
      await ensureSkills();
      if (category) {
        const frameworks = getCategoryFrameworks(category);
        if (!frameworks.length) {
          console.error(chalk.red(`Unknown category: ${category}`));
          console.error(`Run ${chalk.cyan('founder list')} to see all categories.`);
          process.exit(1);
        }
        console.log(chalk.bold(`\n${category} frameworks:\n`));
        for (const fw of frameworks) {
          console.log(`  ${chalk.cyan(fw.slug)} — ${fw.name}: ${fw.description}`);
        }
        console.log();
      } else {
        const categories = getAllCategories();
        console.log(chalk.bold('\nAvailable categories:\n'));
        for (const cat of categories) {
          console.log(`  ${chalk.cyan(cat.name.padEnd(20))} ${chalk.dim(`${cat.frameworkCount} frameworks`)}  ${cat.description}`);
        }
        console.log(`\n  ${chalk.dim('Total: ' + categories.reduce((sum, c) => sum + c.frameworkCount, 0) + ' frameworks')}\n`);
      }
    });

  const configCmd = program
    .command('config')
    .description('Show or update configuration');

  configCmd
    .command('show', { isDefault: true })
    .description('Show current config')
    .action(() => {
      const cfg = showConfig();
      console.log(chalk.bold('\nCurrent configuration:\n'));
      for (const [key, value] of Object.entries(cfg)) {
        if (value !== undefined) {
          console.log(`  ${chalk.cyan(key.padEnd(12))} ${value}`);
        }
      }
      console.log();
    });

  configCmd
    .command('set <key> <value>')
    .description('Set a config value (provider, model, apiKey, baseUrl)')
    .action((key: string, value: string) => {
      try {
        setConfig(key, value);
        console.log(chalk.green(`Set ${key} = ${key === 'apiKey' ? value.slice(0, 8) + '...' : value}`));
      } catch (e: any) {
        console.error(chalk.red(e.message));
        process.exit(1);
      }
    });

  configCmd
    .command('setup')
    .description('Run interactive setup wizard')
    .action(async () => {
      await runSetup();
    });

  program
    .command('models')
    .description('List available models (fetches live from your provider)')
    .action(async () => {
      const config = getConfig();
      if (!config.apiKey) {
        console.log(chalk.dim('No API key configured. Showing defaults.\n'));
        for (const [provider, models] of Object.entries(RECOMMENDED_MODELS)) {
          console.log(`  ${chalk.cyan(provider.padEnd(14))} ${models.join(', ')}`);
        }
        console.log(chalk.dim('\nRun `founder config setup` to configure and fetch live models.'));
        return;
      }

      console.log(chalk.dim(`Fetching models from ${config.provider}...\n`));
      try {
        const { fetchModelsForProvider } = await import('./ui/setup.js');
        const models = await fetchModelsForProvider(config.provider, config.apiKey);
        if (models.length > 0) {
          console.log(chalk.bold(`Available ${config.provider} models:\n`));
          for (const m of models) {
            const current = config.model === m || (!config.model && m === DEFAULT_MODELS[config.provider]);
            console.log(`  ${current ? chalk.green('→ ' + m) : '  ' + m}`);
          }
        } else {
          console.log(chalk.dim('Could not fetch models. Showing defaults:\n'));
          const models = RECOMMENDED_MODELS[config.provider] ?? [];
          for (const m of models) {
            console.log(`  ${m}`);
          }
        }
      } catch {
        for (const [provider, models] of Object.entries(RECOMMENDED_MODELS)) {
          console.log(`  ${chalk.cyan(provider.padEnd(14))} ${models.join(', ')}`);
        }
      }
      console.log();
    });

  program
    .command('update')
    .description('Update founder to the latest version')
    .action(async () => {
      await forceUpdateSkills();
      await runUpdate();
    });

  program
    .command('completion [shell]')
    .description('Output shell completion script (bash, zsh, fish)')
    .action((shell?: string) => {
      switch (shell) {
        case 'bash':
          process.stdout.write(generateBashCompletion());
          break;
        case 'zsh':
          process.stdout.write(generateZshCompletion());
          break;
        case 'fish':
          process.stdout.write(generateFishCompletion());
          break;
        default:
          // Auto-detect shell
          const sh = process.env.SHELL ?? '';
          if (sh.includes('zsh')) {
            process.stdout.write(generateZshCompletion());
          } else if (sh.includes('fish')) {
            process.stdout.write(generateFishCompletion());
          } else {
            process.stdout.write(generateBashCompletion());
          }
      }
    });

  return program;
}

export async function run(argv: string[]): Promise<void> {
  // Handle --completions before anything else (fast path for tab completion)
  const completionsIdx = argv.indexOf('--completions');
  if (completionsIdx !== -1) {
    const line = argv.slice(completionsIdx + 1).join(' ');
    handleCompletions(line);
    return;
  }

  // Non-blocking update check
  checkForUpdate().catch(() => {});

  const program = createProgram();
  await program.parseAsync(argv);
}
