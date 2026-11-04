import test from 'node:test';
import assert from 'node:assert/strict';
import { testThinkFeel } from '../test-sdk-thinkfeel.js';

test('testThinkFeel passes native SDK origin and optional personify input', async () => {
  const calls = {};

  class FakeThinkFeel {
    constructor(config) {
      calls.config = config;
    }

    async generate(options) {
      calls.generate = options;
      return { rateLimits: [], chunks: ['generated'], finalReply: 'generated', replyChoices: ['variation'] };
    }

    async personify(options) {
      calls.personify = options;
      return { chunks: ['personified'], personified: 'personified' };
    }
  }

  const result = await testThinkFeel(
    {
      content: 'hello',
      apiKey: 'test-key',
      personaId: 'persona-123',
      personifyRaw: 'neutral base response',
      sdkBaseUrl: 'https://example.thinkfeel.dev',
    },
    { log: () => {}, ThinkFeel: FakeThinkFeel }
  );

  assert.deepEqual(calls.config, { apiKey: 'test-key', personaId: 'persona-123', baseUrl: 'https://example.thinkfeel.dev' });
  assert.deepEqual(calls.generate, { includeVariations: true, messages: [{ role: 'user', content: 'hello' }] });
  assert.deepEqual(calls.personify, { raw: 'neutral base response' });
  assert.equal(result.personifyResponse.personified, 'personified');
});
