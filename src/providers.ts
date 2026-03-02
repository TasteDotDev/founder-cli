import type { Config } from './config.js';

export const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-5.2',
  google: 'gemini-2.5-flash',
  openrouter: 'anthropic/claude-sonnet-4-6',
};

export const RECOMMENDED_MODELS: Record<string, string[]> = {
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  openai: ['gpt-5.2', 'gpt-5.2-pro', 'gpt-5.2-codex'],
  google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  openrouter: ['anthropic/claude-sonnet-4-6', 'openai/gpt-5.2', 'google/gemini-2.5-flash'],
};

export async function getModel(config: Config) {
  const modelId = config.model ?? DEFAULT_MODELS[config.provider] ?? 'gpt-4o';

  let model;
  switch (config.provider) {
    case 'anthropic': {
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      model = createAnthropic({ apiKey: config.apiKey })(modelId);
      break;
    }
    case 'openai': {
      const { createOpenAI } = await import('@ai-sdk/openai');
      model = createOpenAI({ apiKey: config.apiKey })(modelId);
      break;
    }
    case 'google': {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      model = createGoogleGenerativeAI({ apiKey: config.apiKey })(modelId);
      break;
    }
    case 'openrouter': {
      const { createOpenAI } = await import('@ai-sdk/openai');
      model = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: config.apiKey,
      })(modelId);
      break;
    }
    case 'custom': {
      const { createOpenAI } = await import('@ai-sdk/openai');
      model = createOpenAI({
        baseURL: config.baseUrl!,
        apiKey: config.apiKey,
      })(modelId);
      break;
    }
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }

  return { model, modelId };
}
