import { generateText } from 'ai';
import { describe, it, expect, vi } from 'vitest';
import { createThinkFeelProvider } from '@/src/lib/thinkfeel-provider';

describe('ThinkFeel provider wiring', () => {
  it('targets /completions and sends bearer auth without streaming/tool flags', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = String(input);
      expect(requestUrl).toBe('https://example.thinkfeel.dev/api/v1/completions');

      const headers = new Headers(init?.headers);
      expect(headers.get('authorization')).toBe('Bearer test-key');

      const bodyRaw = String(init?.body ?? '');
      const body = JSON.parse(bodyRaw) as Record<string, unknown>;

      expect(body.model).toBe('persona-123');
      expect(body.stream).toBeUndefined();
      expect(body.tools).toBeUndefined();

      return new Response(
        JSON.stringify({
          id: 'cmpl-1',
          object: 'text_completion',
          created: Math.floor(Date.now() / 1000),
          model: 'persona-123',
          choices: [{ text: 'hello from thinkfeel', index: 0, logprobs: null, finish_reason: 'stop' }],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    const provider = createThinkFeelProvider({
      env: {
        NODE_ENV: 'test',
        CURVE_API_KEY: 'test-key',
        THINKFEEL_BASE_URL: 'https://example.thinkfeel.dev/api/v1',
      },
      fetch: fetchMock as typeof fetch,
    });

    const result = await generateText({
      model: provider.completion('persona-123'),
      prompt: 'hi',
    });

    expect(result.text).toBe('hello from thinkfeel');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
