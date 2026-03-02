import prompts from 'prompts';
import chalk from 'chalk';
import { setConfig, type Provider } from '../config.js';
import { DEFAULT_MODELS } from '../providers.js';

const PROVIDERS: { title: string; value: Provider; description: string }[] = [
  { title: 'Anthropic (Claude)', value: 'anthropic', description: 'Claude Opus, Sonnet, Haiku' },
  { title: 'OpenAI', value: 'openai', description: 'GPT, o-series, Codex' },
  { title: 'Google (Gemini)', value: 'google', description: 'Gemini Pro, Flash' },
  { title: 'OpenRouter', value: 'openrouter', description: 'Any model via openrouter.ai' },
  { title: 'Custom (OpenAI-compatible)', value: 'custom', description: 'Any OpenAI-compatible API' },
];

export async function runSetup(): Promise<void> {
  console.log(chalk.bold('\nFounder CLI Setup\n'));
  console.log(chalk.dim('Configure your LLM provider and API key.\n'));

  const { provider } = await prompts({
    type: 'select',
    name: 'provider',
    message: 'Choose your LLM provider',
    choices: PROVIDERS,
  });

  if (!provider) {
    console.log(chalk.dim('Setup cancelled.'));
    process.exit(1);
  }

  setConfig('provider', provider);

  const { apiKey } = await prompts({
    type: 'password',
    name: 'apiKey',
    message: `Enter your ${provider} API key`,
  });

  if (!apiKey) {
    console.log(chalk.dim('Setup cancelled.'));
    process.exit(1);
  }

  setConfig('apiKey', apiKey);

  if (provider === 'custom') {
    const { baseUrl } = await prompts({
      type: 'text',
      name: 'baseUrl',
      message: 'Enter the API base URL',
      initial: 'http://localhost:11434/v1',
    });

    if (baseUrl) {
      setConfig('baseUrl', baseUrl);
    }
  }

  // Fetch available models from the provider's API
  console.log(chalk.dim('\nFetching available models...'));
  const models = await fetchModels(provider, apiKey);

  if (models.length > 0) {
    const { model } = await prompts({
      type: 'select',
      name: 'model',
      message: 'Choose a model',
      choices: [
        ...models.map(m => ({ title: m, value: m })),
        { title: 'Enter custom model ID', value: '__custom__' },
      ],
    });

    if (model === '__custom__') {
      const { customModel } = await prompts({
        type: 'text',
        name: 'customModel',
        message: 'Enter the model ID',
      });
      if (customModel) {
        setConfig('model', customModel);
      }
    } else if (model) {
      setConfig('model', model);
    }
  } else {
    console.log(chalk.dim(`Could not fetch models. Using default: ${DEFAULT_MODELS[provider]}`));
    const { customModel } = await prompts({
      type: 'text',
      name: 'customModel',
      message: 'Enter a model ID (or press Enter for default)',
    });
    if (customModel) {
      setConfig('model', customModel);
    }
  }

  console.log(chalk.green('\nSetup complete!'));
  console.log(chalk.dim(`Config saved. Run ${chalk.cyan('founder config show')} to review.\n`));
}

export { fetchModels as fetchModelsForProvider };

async function fetchModels(provider: Provider, apiKey: string): Promise<string[]> {
  try {
    switch (provider) {
      case 'anthropic':
        return await fetchAnthropicModels(apiKey);
      case 'openai':
        return await fetchOpenAIModels(apiKey);
      case 'google':
        return await fetchGoogleModels(apiKey);
      case 'openrouter':
        return await fetchOpenRouterModels(apiKey);
      default:
        return [];
    }
  } catch {
    return [];
  }
}

async function fetchAnthropicModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });
  if (!res.ok) return [];
  const data = await res.json() as { data?: { id: string }[] };
  const models = (data.data ?? []).map(m => m.id);
  // Sort: prefer claude models, newest first
  return models
    .filter(m => m.startsWith('claude-'))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);
}

async function fetchOpenAIModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = await res.json() as { data?: { id: string }[] };
  const models = (data.data ?? []).map(m => m.id);
  // Filter to chat models, sort newest first
  const chatModels = models.filter(m =>
    m.startsWith('gpt-') || m.startsWith('o1') || m.startsWith('o3') || m.startsWith('o4')
  );
  return chatModels
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);
}

async function fetchGoogleModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) return [];
  const data = await res.json() as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
  const models = (data.models ?? [])
    .filter(m => {
      const methods = m.supportedGenerationMethods ?? [];
      return methods.includes('generateContent');
    })
    .map(m => m.name.replace('models/', ''))
    .filter(m => m.startsWith('gemini-'))
    // Exclude preview models that have tool-calling issues
    .filter(m => !m.includes('3.1-pro-preview') && !m.includes('3-pro-preview'));
  return models
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 10);
}

async function fetchOpenRouterModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) return [];
  const data = await res.json() as { data?: { id: string }[] };
  const models = (data.data ?? []).map(m => m.id);
  // Pick top popular ones
  const preferred = [
    'anthropic/claude', 'openai/gpt', 'google/gemini', 'meta-llama/', 'mistralai/'
  ];
  return models
    .filter(m => preferred.some(p => m.includes(p)))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 15);
}
