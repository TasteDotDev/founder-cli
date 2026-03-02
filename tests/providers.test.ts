import { describe, it, expect } from 'vitest';
import { DEFAULT_MODELS, RECOMMENDED_MODELS } from '../src/providers.js';

describe('providers', () => {
  it('has default models for all providers', () => {
    expect(DEFAULT_MODELS.anthropic).toBeTruthy();
    expect(DEFAULT_MODELS.openai).toBeTruthy();
    expect(DEFAULT_MODELS.google).toBeTruthy();
    expect(DEFAULT_MODELS.openrouter).toBeTruthy();
  });

  it('has recommended models for all providers', () => {
    expect(RECOMMENDED_MODELS.anthropic.length).toBeGreaterThan(0);
    expect(RECOMMENDED_MODELS.openai.length).toBeGreaterThan(0);
    expect(RECOMMENDED_MODELS.google.length).toBeGreaterThan(0);
    expect(RECOMMENDED_MODELS.openrouter.length).toBeGreaterThan(0);
  });

  it('default model is in recommended list', () => {
    for (const [provider, defaultModel] of Object.entries(DEFAULT_MODELS)) {
      const recommended = RECOMMENDED_MODELS[provider];
      if (recommended) {
        expect(
          recommended.includes(defaultModel),
          `Default model ${defaultModel} for ${provider} should be in recommended list`
        ).toBe(true);
      }
    }
  });
});
