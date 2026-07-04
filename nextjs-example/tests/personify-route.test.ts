import { it, vi, expect, describe, afterEach } from 'vitest';
import { POST as personifyPost } from '@/app/api/personify/route';

const ORIGINAL_ENV = process.env;

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe('POST /api/personify', () => {
  it('returns 400 validation error when body is invalid JSON', async () => {
    const request = new Request('http://localhost/api/personify', {
      method: 'POST',
      body: '{"raw":',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await personifyPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(400);
    expect(body.error.type).toBe('validation');
    expect(body.error.message).toContain('valid JSON');
  });

  it('posts raw text to ThinkFeel /personify with x-api-key auth', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    process.env.THINKFEEL_PERSONA_ID = 'persona-default';
    process.env.THINKFEEL_BASE_URL = 'https://example.thinkfeel.dev/api/v1';

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe('https://example.thinkfeel.dev/api/v1/personify');

      const headers = new Headers(init?.headers);
      expect(headers.get('x-api-key')).toBe('test-key');
      expect(headers.get('content-type')).toBe('application/json');

      const body = JSON.parse(String(init?.body ?? '{}')) as { raw?: string; personaId?: string };
      expect(body.raw).toBe('base response');
      expect(body.personaId).toBe('persona-default');

      return new Response(JSON.stringify({ personified: 'persona response', chunks: ['persona response'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/personify', {
      method: 'POST',
      body: JSON.stringify({ raw: 'base response' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await personifyPost(request);
    const body = (await response.json()) as { personified: string; chunks: string[]; model: string };

    expect(response.status).toBe(200);
    expect(body.personified).toBe('persona response');
    expect(body.chunks).toEqual(['persona response']);
    expect(body.model).toBe('persona-default');
  });

  it('uses request personaId when provided', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    process.env.THINKFEEL_PERSONA_ID = 'persona-default';
    process.env.THINKFEEL_BASE_URL = 'https://example.thinkfeel.dev/api/v1/';

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as { personaId?: string };
      expect(body.personaId).toBe('persona-from-request');

      return new Response(JSON.stringify({ personified: 'override response', chunks: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/personify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: 'base response', personaId: 'persona-from-request' }),
    });

    const response = await personifyPost(request);
    const body = (await response.json()) as { model: string };

    expect(response.status).toBe(200);
    expect(body.model).toBe('persona-from-request');
  });

  it('returns 500 config error when personaId is missing', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    delete process.env.THINKFEEL_PERSONA_ID;
    delete process.env.CURVE_PERSONA_ID;

    const request = new Request('http://localhost/api/personify', {
      method: 'POST',
      body: JSON.stringify({ raw: 'base response' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await personifyPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(500);
    expect(body.error.type).toBe('config');
    expect(body.error.message).toContain('THINKFEEL_PERSONA_ID');
  });

  it('maps upstream text errors into provider errors', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    process.env.THINKFEEL_PERSONA_ID = 'persona-default';

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Unknown `personaId` was provided in the body.', { status: 404 }))
    );

    const request = new Request('http://localhost/api/personify', {
      method: 'POST',
      body: JSON.stringify({ raw: 'base response' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await personifyPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(502);
    expect(body.error.type).toBe('provider');
    expect(body.error.message).toContain('Unknown `personaId`');
  });
});
