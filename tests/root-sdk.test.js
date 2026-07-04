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
      return { finalReply: 'generated', replyChoices: ['variation'], rateLimits: [], chunks: ['generated'] };
    }

    async personify(options) {
      calls.personify = options;
      return { personified: 'personified', chunks: ['personified'] };
    }
  }

  const result = await testThinkFeel(
    {
      apiKey: 'test-key',
      content: 'hello',
      personaId: 'persona-123',
      sdkBaseUrl: 'https://example.thinkfeel.dev',
      personifyRaw: 'neutral base response',
    },
    { ThinkFeel: FakeThinkFeel, log: () => {} }
  );

  assert.deepEqual(calls.config, {
    apiKey: 'test-key',
    personaId: 'persona-123',
    baseUrl: 'https://example.thinkfeel.dev',
  });
  assert.deepEqual(calls.generate, {
    messages: [{ role: 'user', content: 'hello' }],
    includeVariations: true,
  });
  assert.deepEqual(calls.personify, { raw: 'neutral base response' });
  assert.equal(result.personifyResponse.personified, 'personified');
});
