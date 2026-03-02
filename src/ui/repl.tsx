import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import { isConfigured } from '../config.js';
import { runSetup } from './setup.js';
import { VERSION } from '../version.js';
import { getAllCategories } from '../skills/loader.js';
import { ensureSkills } from '../skills/sync.js';
import { initMarkdown } from './output.js';
import App from './App.js';

export async function startRepl(): Promise<void> {
  if (!isConfigured()) {
    await runSetup();
  }

  await ensureSkills();
  await initMarkdown();

  if (!process.stdin.isTTY) {
    console.error(chalk.red('Interactive mode requires a TTY. Pipe input or use: founder "your question"'));
    process.exit(1);
  }

  const { waitUntilExit } = render(<App />, { patchConsole: false });

  try {
    await waitUntilExit();
  } finally {
    // nothing to restore — we stay in the normal screen buffer
  }

  console.log(chalk.dim('Bye.'));
}
