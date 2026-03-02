import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We test the config logic by testing the env detection and config resolution
describe('config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore env
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('detects anthropic from ANTHROPIC_API_KEY', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test123';
    const { getConfig } = await import('../src/config.js');
    const config = getConfig();
    expect(config.provider).toBe('anthropic');
    expect(config.apiKey).toBe('sk-ant-test123');
  });

  it('detects openai from OPENAI_API_KEY', async () => {
    process.env.OPENAI_API_KEY = 'sk-openai-test123';
    // Clear anthropic key if set
    delete process.env.ANTHROPIC_API_KEY;
    const { getConfig } = await import('../src/config.js');
    const config = getConfig();
    expect(config.provider).toBe('openai');
    expect(config.apiKey).toBe('sk-openai-test123');
  });

  it('detects google from GOOGLE_API_KEY', async () => {
    process.env.GOOGLE_API_KEY = 'AIza-test123';
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const { getConfig } = await import('../src/config.js');
    const config = getConfig();
    expect(config.provider).toBe('google');
    expect(config.apiKey).toBe('AIza-test123');
  });

  it('setConfig validates key names', async () => {
    const { setConfig } = await import('../src/config.js');
    expect(() => setConfig('invalid', 'value')).toThrow('Unknown config key');
  });

  it('showConfig masks API key', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-long-secret-key-12345';
    const { showConfig } = await import('../src/config.js');
    const cfg = showConfig();
    expect(cfg.apiKey).toMatch(/^sk-ant-l\.\.\.$/);
  });
});
