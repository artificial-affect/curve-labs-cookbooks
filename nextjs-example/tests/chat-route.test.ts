import { POST as chatPost } from '@/app/api/chat/route';
import { it, vi, expect, describe, afterEach } from 'vitest';

const ORIGINAL_ENV = process.env;

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe('POST /api/chat', () => {
  it('returns 400 validation error when body is invalid JSON', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"messages":',
    });

    const response = await chatPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(400);
    expect(body.error.type).toBe('validation');
    expect(body.error.message).toContain('valid JSON');
  });

  it('returns 200 with a reply for a valid multi-turn chat history', async () => {
    process.env.CURVE_API_KEY = 'test-key';
    process.env.CURVE_PERSONA_ID = 'persona-default';
    process.env.THINKFEEL_BASE_URL = 'https://example.thinkfeel.dev/api/v1';

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}')) as { prompt?: string };
      expect(requestBody.prompt).toContain("User: hello it's me again");

      return new Response(
        JSON.stringify({
          created: 1,
          id: 'cmpl-1',
          model: 'persona-default',
          object: 'text_completion',
          choices: [{ text: 'welcome back', index: 0, logprobs: null, finish_reason: 'stop' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'hello' },
          { role: 'assistant', content: 'hey there' },
          { role: 'user', content: "hello it's me again" },
        ],
      }),
    });

    const response = await chatPost(request);
    const body = (await response.json()) as { reply: string; model: string };

    expect(response.status).toBe(200);
    expect(body.reply).toBe('welcome back');
    expect(body.model).toBe('persona-default');
  });

  it('uses request personaId when provided even when CURVE_PERSONA_ID exists', async () => {
    process.env.CURVE_API_KEY = 'test-key';
    process.env.CURVE_PERSONA_ID = 'persona-default';
    process.env.THINKFEEL_BASE_URL = 'https://example.thinkfeel.dev/api/v1';

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
      expect(requestBody.model).toBe('persona-from-request');

      return new Response(
        JSON.stringify({
          created: 1,
          id: 'cmpl-1',
          object: 'text_completion',
          model: 'persona-from-request',
          choices: [{ text: 'persona override works', index: 0, logprobs: null, finish_reason: 'stop' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId: 'persona-from-request',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await chatPost(request);
    const body = (await response.json()) as { reply: string; model: string };

    expect(response.status).toBe(200);
    expect(body.model).toBe('persona-from-request');
    expect(body.reply).toBe('persona override works');
  });

  it('returns 400 validation error for invalid message role', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'bot', content: 'not allowed' }] }),
    });

    const response = await chatPost(request);
    const body = (await response.json()) as { error: { type: string } };

    expect(response.status).toBe(400);
    expect(body.error.type).toBe('validation');
  });

  it('returns provider error when upstream fails', async () => {
    process.env.CURVE_API_KEY = 'test-key';
    process.env.CURVE_PERSONA_ID = 'persona-default';

    const fetchMock = vi.fn(async () => {
      throw new Error('upstream failure');
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
    });

    const response = await chatPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(502);
    expect(body.error.type).toBe('provider');
    expect(body.error.message.length).toBeGreaterThan(0);
  });

  it('returns 500 config error when CURVE_PERSONA_ID is missing and request personaId is not provided', async () => {
    process.env.CURVE_API_KEY = 'test-key';
    delete process.env.CURVE_PERSONA_ID;

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
    });

    const response = await chatPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(500);
    expect(body.error.type).toBe('config');
    expect(body.error.message).toContain('CURVE_PERSONA_ID');
  });
});
