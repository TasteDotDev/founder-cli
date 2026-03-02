import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('webSearchTool', () => {
  it('has correct tool description and parameters', async () => {
    const { webSearchTool } = await import('../src/tools/web-search.js');
    expect(webSearchTool.description).toContain('Search the web');
    expect(webSearchTool.parameters).toBeDefined();
  });

  it('handles search errors gracefully', async () => {
    const { webSearchTool } = await import('../src/tools/web-search.js');
    // Mock fetch to fail
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await webSearchTool.execute(
      { query: 'test query' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('Network error');
    expect(result.results).toEqual([]);

    globalThis.fetch = originalFetch;
  });

  it('handles non-200 responses', async () => {
    const { webSearchTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });

    const result = await webSearchTool.execute(
      { query: 'test' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('429');

    globalThis.fetch = originalFetch;
  });

  it('parses HTML results', async () => {
    const { webSearchTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`
        <a class="result-link" href="https://example.com">Example Title</a>
        <td class="result-snippet">This is a snippet</td>
      `),
    });

    const result = await webSearchTool.execute(
      { query: 'test' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.results.length).toBe(1);
    expect(result.results[0].title).toBe('Example Title');
    expect(result.results[0].url).toBe('https://example.com');

    globalThis.fetch = originalFetch;
  });

  it('returns message when no results found', async () => {
    const { webSearchTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><body>No results</body></html>'),
    });

    const result = await webSearchTool.execute(
      { query: 'zzz nonexistent query' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.message).toContain('No results');

    globalThis.fetch = originalFetch;
  });
});

describe('readWebPageTool', () => {
  it('has correct tool description', async () => {
    const { readWebPageTool } = await import('../src/tools/web-search.js');
    expect(readWebPageTool.description).toContain('Fetch and read');
  });

  it('handles fetch errors gracefully', async () => {
    const { readWebPageTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const result = await readWebPageTool.execute(
      { url: 'https://nonexistent.example.com' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('Connection refused');

    globalThis.fetch = originalFetch;
  });

  it('handles non-200 responses', async () => {
    const { readWebPageTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const result = await readWebPageTool.execute(
      { url: 'https://example.com/404' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.error).toContain('404');

    globalThis.fetch = originalFetch;
  });

  it('extracts text from HTML', async () => {
    const { readWebPageTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Map([['content-type', 'text/html']]) as any,
      text: () =>
        Promise.resolve('<html><body><h1>Title</h1><p>Content here</p><script>var x=1;</script></body></html>'),
    });

    const result = await readWebPageTool.execute(
      { url: 'https://example.com' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.content).toContain('Title');
    expect(result.content).toContain('Content here');
    expect(result.content).not.toContain('var x=1');

    globalThis.fetch = originalFetch;
  });

  it('truncates long content', async () => {
    const { readWebPageTool } = await import('../src/tools/web-search.js');
    const originalFetch = globalThis.fetch;
    const longText = '<html><body>' + 'a'.repeat(10000) + '</body></html>';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Map([['content-type', 'text/html']]) as any,
      text: () => Promise.resolve(longText),
    });

    const result = await readWebPageTool.execute(
      { url: 'https://example.com/long' },
      { toolCallId: 'test', messages: [], abortSignal: undefined as any }
    );
    expect(result.content).toContain('[... truncated]');

    globalThis.fetch = originalFetch;
  });
});
