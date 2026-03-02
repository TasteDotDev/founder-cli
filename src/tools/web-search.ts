import { tool } from 'ai';
import { z } from 'zod';

/**
 * Extracts text content from HTML, stripping tags and excessive whitespace.
 */
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function parseDuckDuckGoResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  // DDG lite uses <a> tags with class="result-link" or we parse the table structure
  const linkRegex = /<a[^>]+class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<td[^>]+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;

  const links: { url: string; title: string }[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({ url: match[1], title: extractText(match[2]) });
  }

  const snippets: string[] = [];
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(extractText(match[1]));
  }

  for (let i = 0; i < links.length && i < 10; i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      snippet: snippets[i] ?? '',
    });
  }

  // Fallback: try to find regular links if the above didn't work
  if (results.length === 0) {
    const fallbackRegex = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const seen = new Set<string>();
    while ((match = fallbackRegex.exec(html)) !== null) {
      const url = match[1];
      const title = extractText(match[2]);
      if (title.length > 5 && !seen.has(url) && !url.includes('duckduckgo.com')) {
        seen.add(url);
        results.push({ title, url, snippet: '' });
        if (results.length >= 10) break;
      }
    }
  }

  return results;
}

export const webSearchTool = tool({
  description:
    'Search the web for current information. Use this for market research, competitive analysis, industry trends, company info, pricing data, news, and any real-time information. Be generous with searches — do multiple searches to build a thorough picture.',
  parameters: z.object({
    query: z
      .string()
      .describe('Search query — be specific (e.g. "Notion pricing 2025" not just "Notion")'),
  }),
  execute: async ({ query }) => {
    try {
      const url = `https://lite.duckduckgo.com/lite?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FounderCLI/1.0)',
        },
      });

      if (!res.ok) {
        return { error: `Search failed: ${res.status}`, results: [] };
      }

      const html = await res.text();
      const results = parseDuckDuckGoResults(html);

      if (results.length === 0) {
        return {
          message: 'No results found. Try a different query.',
          results: [],
        };
      }

      return { results };
    } catch (e: any) {
      return { error: `Search failed: ${e.message}`, results: [] };
    }
  },
});

export const readWebPageTool = tool({
  description:
    'Fetch and read a web page. Use this to get detailed information from a URL found via web search — company pages, blog posts, pricing pages, documentation, articles, etc.',
  parameters: z.object({
    url: z.string().describe('Full URL to fetch (e.g. https://example.com/pricing)'),
  }),
  execute: async ({ url }) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FounderCLI/1.0)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return { error: `Failed to fetch: ${res.status} ${res.statusText}` };
      }

      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/json')) {
        return { error: `Unsupported content type: ${contentType}` };
      }

      const html = await res.text();
      let text = extractText(html);

      // Truncate to ~8000 chars to avoid blowing up context
      if (text.length > 8000) {
        text = text.slice(0, 8000) + '\n\n[... truncated]';
      }

      return { url, content: text };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { error: 'Request timed out after 15 seconds' };
      }
      return { error: `Failed to fetch: ${e.message}` };
    }
  },
});
