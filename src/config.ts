import Conf from 'conf';
import { existsSync } from 'fs';
import { join } from 'path';

export type Provider = 'anthropic' | 'openai' | 'google' | 'openrouter' | 'custom';

export interface Config {
  provider: Provider;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}

const store = new Conf<Config>({
  projectName: 'founder',
  schema: {
    provider: { type: 'string', default: 'anthropic' },
    model: { type: 'string' },
    apiKey: { type: 'string' },
    baseUrl: { type: 'string' },
  },
});

const ENV_KEY_MAP: Record<string, Provider> = {
  ANTHROPIC_API_KEY: 'anthropic',
  OPENAI_API_KEY: 'openai',
  GOOGLE_API_KEY: 'google',
  GOOGLE_GENERATIVE_AI_API_KEY: 'google',
  OPENROUTER_API_KEY: 'openrouter',
};

function detectProviderFromEnv(): { provider: Provider; apiKey: string } | null {
  for (const [envVar, provider] of Object.entries(ENV_KEY_MAP)) {
    const key = process.env[envVar];
    if (key) {
      return { provider, apiKey: key };
    }
  }
  return null;
}

export function getConfig(): Config {
  // Priority: env vars > config file > defaults
  const envDetected = detectProviderFromEnv();

  if (envDetected) {
    return {
      provider: envDetected.provider,
      apiKey: envDetected.apiKey,
      model: store.get('model'),
    };
  }

  const provider = store.get('provider');
  const apiKey = store.get('apiKey');

  if (provider && apiKey) {
    return {
      provider,
      apiKey,
      model: store.get('model'),
      baseUrl: store.get('baseUrl'),
    };
  }

  return { provider: provider ?? 'anthropic' };
}

export function isConfigured(): boolean {
  const config = getConfig();
  return !!config.apiKey;
}

export function setConfig(key: string, value: string): void {
  if (key === 'provider') {
    store.set('provider', value as Provider);
  } else if (key === 'model') {
    store.set('model', value);
  } else if (key === 'apiKey') {
    store.set('apiKey', value);
  } else if (key === 'baseUrl') {
    store.set('baseUrl', value);
  } else {
    throw new Error(`Unknown config key: ${key}. Valid keys: provider, model, apiKey, baseUrl`);
  }
}

export function showConfig(): Record<string, string | undefined> {
  const config = getConfig();
  return {
    provider: config.provider,
    model: config.model ?? '(default)',
    apiKey: config.apiKey ? config.apiKey.slice(0, 8) + '...' : '(not set)',
    baseUrl: config.baseUrl,
    configPath: store.path,
  };
}

export function getConfigStore() {
  return store;
}
