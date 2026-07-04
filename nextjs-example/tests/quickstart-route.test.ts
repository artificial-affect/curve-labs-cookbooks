import { it, vi, expect, describe, afterEach } from 'vitest';
import { POST as quickstartPost } from '@/app/api/quickstart/route';

const ORIGINAL_ENV = process.env;

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe('POST /api/quickstart', () => {
  it('returns 400 validation error when body is invalid JSON', async () => {
    const request = new Request('http://localhost/api/quickstart', {
      method: 'POST',
      body: '{"prompt":',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await quickstartPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(400);
    expect(body.error.type).toBe('validation');
    expect(body.error.message).toContain('valid JSON');
  });

  it('returns 200 with generated text for a valid prompt', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    process.env.THINKFEEL_PERSONA_ID = 'persona-default';
    process.env.THINKFEEL_BASE_URL = 'https://example.thinkfeel.dev/api/v1';

    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            created: 1,
            id: 'cmpl-1',
            model: 'persona-default',
            object: 'text_completion',
            choices: [{ text: 'generated output', index: 0, logprobs: null, finish_reason: 'stop' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/quickstart', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'hello' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await quickstartPost(request);
    const body = (await response.json()) as { text: string; model: string };

    expect(response.status).toBe(200);
    expect(body.text).toBe('generated output');
    expect(body.model).toBe('persona-default');
  });

  it('uses request personaId when provided even when THINKFEEL_PERSONA_ID exists', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    process.env.THINKFEEL_PERSONA_ID = 'persona-default';
    process.env.THINKFEEL_BASE_URL = 'https://example.thinkfeel.dev/api/v1';

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const bodyRaw = String(init?.body ?? '');
      const body = JSON.parse(bodyRaw) as { model: string };

      expect(body.model).toBe('persona-from-request');

      return new Response(
        JSON.stringify({
          created: 1,
          id: 'cmpl-1',
          object: 'text_completion',
          model: 'persona-from-request',
          choices: [{ text: 'generated output', index: 0, logprobs: null, finish_reason: 'stop' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost/api/quickstart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hello', personaId: 'persona-from-request' }),
    });

    const response = await quickstartPost(request);
    const body = (await response.json()) as { text: string; model: string };

    expect(response.status).toBe(200);
    expect(body.model).toBe('persona-from-request');
  });

  it('returns 400 validation error for an empty prompt', async () => {
    const request = new Request('http://localhost/api/quickstart', {
      method: 'POST',
      body: JSON.stringify({ prompt: '' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await quickstartPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(400);
    expect(body.error.type).toBe('validation');
  });

  it('returns 500 config error when THINKFEEL_API_KEY and THINKFEEL_PERSONA_ID are both missing', async () => {
    delete process.env.THINKFEEL_API_KEY;
    delete process.env.THINKFEEL_PERSONA_ID;

    delete process.env.CURVE_API_KEY;
    delete process.env.CURVE_PERSONA_ID;

    const request = new Request('http://localhost/api/quickstart', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'hello' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await quickstartPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(500);
    expect(body.error.type).toBe('config');
  });

  it('returns 500 config error when THINKFEEL_PERSONA_ID is missing and request personaId is not provided', async () => {
    process.env.THINKFEEL_API_KEY = 'test-key';
    delete process.env.THINKFEEL_PERSONA_ID;
    delete process.env.CURVE_PERSONA_ID;

    const request = new Request('http://localhost/api/quickstart', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'hello' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await quickstartPost(request);
    const body = (await response.json()) as { error: { type: string; message: string } };

    expect(response.status).toBe(500);
    expect(body.error.type).toBe('config');
    expect(body.error.message).toContain('THINKFEEL_PERSONA_ID');
  });
});
