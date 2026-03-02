import chalk from 'chalk';

// Direct markdown-to-ANSI renderer using raw escape codes.
// Bypasses marked-terminal entirely — it has chalk.level=0 issues
// when bundled by tsup and rendered through Ink.

const ESC = '\x1b[';
const BOLD = (t: string) => `${ESC}1m${t}${ESC}22m`;
const ITALIC = (t: string) => `${ESC}3m${t}${ESC}23m`;
const DIM = (t: string) => `${ESC}2m${t}${ESC}22m`;
const UNDERLINE = (t: string) => `${ESC}4m${t}${ESC}24m`;
const STRIKE = (t: string) => `${ESC}9m${t}${ESC}29m`;
const YELLOW = (t: string) => `${ESC}33m${t}${ESC}39m`;
const GREEN = (t: string) => `${ESC}32m${t}${ESC}39m`;
const CYAN = (t: string) => `${ESC}36m${t}${ESC}39m`;
const MAGENTA = (t: string) => `${ESC}35m${t}${ESC}39m`;
const GRAY = (t: string) => `${ESC}90m${t}${ESC}39m`;
const BLUE = (t: string) => `${ESC}34m${t}${ESC}39m`;

export function renderMarkdown(text: string): string {
  let out = text;

  // Code blocks (``` ... ```) — must come before inline code
  out = out.replace(/```[\w]*\n([\s\S]*?)```/g, (_m, code: string) => {
    return code.split('\n').map((line: string) => '  ' + YELLOW(line)).join('\n') + '\n';
  });

  // Headings
  out = out.replace(/^#### (.+)$/gm, (_m, t) => GREEN(BOLD(t)));
  out = out.replace(/^### (.+)$/gm, (_m, t) => GREEN(BOLD('### ' + t)));
  out = out.replace(/^## (.+)$/gm, (_m, t) => CYAN(BOLD('## ' + t)));
  out = out.replace(/^# (.+)$/gm, (_m, t) => MAGENTA(UNDERLINE(BOLD(t))));

  // Horizontal rules
  out = out.replace(/^---+$/gm, GRAY('─'.repeat(60)));

  // Blockquotes
  out = out.replace(/^> (.+)$/gm, (_m, t) => GRAY('  │ ') + ITALIC(t));

  // Bold + italic  (***text***)
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, (_m, t) => BOLD(ITALIC(t)));
  // Bold (**text**)
  out = out.replace(/\*\*(.+?)\*\*/g, (_m, t) => BOLD(t));
  // Italic (*text*)
  out = out.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, (_m, t) => ITALIC(t));
  // Strikethrough (~~text~~)
  out = out.replace(/~~(.+?)~~/g, (_m, t) => STRIKE(DIM(t)));
  // Inline code (`text`)
  out = out.replace(/`([^`\n]+?)`/g, (_m, t) => YELLOW(t));

  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, url) => BLUE(UNDERLINE(t)) + ' ' + GRAY(url));

  // Tables — simple formatting
  out = out.replace(/^\|(.+)\|$/gm, (_m, row: string) => {
    const cells = row.split('|').map((c: string) => c.trim());
    return '  ' + cells.join('  │  ');
  });
  // Remove table separator rows
  out = out.replace(/^\s*[\|]?[\s:]*-{3,}[\s:|-]*$/gm, (_m) => GRAY('  ' + '─'.repeat(50)));

  return out;
}

export async function initMarkdown(): Promise<void> {
  // No-op — kept for backwards compatibility.
}

export function printMarkdown(text: string): void {
  process.stdout.write(renderMarkdown(text));
}

export function printError(message: string): void {
  console.error(chalk.red(`Error: ${message}`));
}

export function printSuccess(message: string): void {
  console.log(chalk.green(message));
}

export function printInfo(message: string): void {
  console.log(chalk.dim(message));
}
