import { getAllCategories, getCategoryFrameworks } from './skills/loader.js';

const SUBCOMMANDS = ['list', 'config', 'models', 'update', 'completion'];
const CONFIG_KEYS = ['provider', 'model', 'apiKey', 'baseUrl'];
const PROVIDERS = ['anthropic', 'openai', 'google', 'openrouter', 'custom'];

/**
 * Handle dynamic completion requests.
 * Called by the shell completion script via: founder --completions <line>
 */
export function handleCompletions(line: string): void {
  const parts = line.trim().split(/\s+/);
  // parts[0] is "founder", rest are args
  const args = parts.slice(1);
  const current = args[args.length - 1] ?? '';
  const prev = args[args.length - 2] ?? '';

  let completions: string[] = [];

  if (args.length <= 1) {
    // Top-level: subcommands + flags
    completions = [...SUBCOMMANDS, '-c', '-f', '--category', '--framework', '--help', '--version'];
  } else if (prev === '-c' || prev === '--category') {
    completions = getCategoryNames();
  } else if (prev === '-f' || prev === '--framework') {
    completions = getAllFrameworkSlugs();
  } else if (args[0] === 'list') {
    completions = getCategoryNames();
  } else if (args[0] === 'config') {
    if (args.length === 2) {
      completions = ['show', 'set', 'setup'];
    } else if (args[1] === 'set' && args.length === 3) {
      completions = CONFIG_KEYS;
    } else if (args[1] === 'set' && args.length === 4 && args[2] === 'provider') {
      completions = PROVIDERS;
    }
  } else if (args[0] === 'completion') {
    completions = ['bash', 'zsh', 'fish'];
  }

  // Filter by current prefix
  if (current) {
    completions = completions.filter(c => c.startsWith(current));
  }

  console.log(completions.join('\n'));
}

function getCategoryNames(): string[] {
  try {
    return getAllCategories().map(c => c.name);
  } catch {
    return [];
  }
}

function getAllFrameworkSlugs(): string[] {
  try {
    const categories = getAllCategories();
    const slugs: string[] = [];
    for (const cat of categories) {
      const frameworks = getCategoryFrameworks(cat.name);
      for (const fw of frameworks) {
        slugs.push(fw.slug);
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

export function generateBashCompletion(): string {
  return `# founder bash completion
# Add to ~/.bashrc:  eval "$(founder completion bash)"

_founder_completions() {
  local cur line
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  line="\${COMP_WORDS[*]}"

  COMPREPLY=( $(compgen -W "$(founder --completions "$line" 2>/dev/null)" -- "$cur") )
}

complete -F _founder_completions founder
`;
}

export function generateZshCompletion(): string {
  return `# founder zsh completion
# Add to ~/.zshrc:  eval "$(founder completion zsh)"

_founder() {
  local -a completions
  completions=(\${(f)"$(founder --completions "\${words[*]}" 2>/dev/null)"})
  compadd -a completions
}

compdef _founder founder
`;
}

export function generateFishCompletion(): string {
  return `# founder fish completion
# Save to ~/.config/fish/completions/founder.fish

complete -c founder -f
complete -c founder -n '__fish_use_subcommand' -a 'list config models update completion' -d 'Subcommand'
complete -c founder -n '__fish_use_subcommand' -s c -l category -xa '(founder --completions "founder -c" 2>/dev/null)' -d 'Category'
complete -c founder -n '__fish_use_subcommand' -s f -l framework -xa '(founder --completions "founder -f" 2>/dev/null)' -d 'Framework'
complete -c founder -n '__fish_seen_subcommand_from list' -xa '(founder --completions "founder list" 2>/dev/null)' -d 'Category'
complete -c founder -n '__fish_seen_subcommand_from config' -a 'show set setup' -d 'Config action'
complete -c founder -n '__fish_seen_subcommand_from completion' -a 'bash zsh fish' -d 'Shell'
`;
}
