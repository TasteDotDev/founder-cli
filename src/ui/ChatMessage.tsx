import React from 'react';
import { Text } from 'ink';
import chalk from 'chalk';
import { renderMarkdown } from './output.js';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  text: string;
  model?: string;
  usage?: { promptTokens: number; completionTokens: number };
  frameworkCount?: number;
  searchCount?: number;
  fileCount?: number;
}

function formatTokens(n: number): string {
  if (isNaN(n) || n === 0) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export default function ChatMessage({ msg }: { msg: Message }) {
  if (msg.role === 'user') {
    return <Text>{chalk.bold.cyan('  you ') + chalk.dim('› ') + msg.text}</Text>;
  }

  if (msg.role === 'system') {
    return <Text>{msg.text}</Text>;
  }

  // Assistant message
  const rendered = msg.text.trim() ? renderMarkdown(msg.text).trimEnd() : '';

  // Build stats line with icons
  const parts: string[] = [];
  if (msg.model) {
    parts.push(`${msg.model}`);
  }
  if (msg.usage && (msg.usage.promptTokens || msg.usage.completionTokens)) {
    parts.push(`${formatTokens(msg.usage.promptTokens)} in ${chalk.dim('→')} ${formatTokens(msg.usage.completionTokens)} out`);
  }
  if (msg.frameworkCount && msg.frameworkCount > 0) {
    parts.push(`${msg.frameworkCount} framework${msg.frameworkCount === 1 ? '' : 's'}`);
  }
  if (msg.searchCount && msg.searchCount > 0) {
    parts.push(`${msg.searchCount} search${msg.searchCount === 1 ? '' : 'es'}`);
  }
  if (msg.fileCount && msg.fileCount > 0) {
    parts.push(`${msg.fileCount} file${msg.fileCount === 1 ? '' : 's'} read`);
  }

  const stats = parts.length > 0
    ? chalk.dim(`  ${parts.join(chalk.dim('  ·  '))}`)
    : '';

  return <Text>{rendered + (stats ? '\n' + stats : '')}</Text>;
}
