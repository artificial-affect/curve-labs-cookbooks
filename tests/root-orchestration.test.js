import test from 'node:test';
import assert from 'node:assert/strict';
import { main, runAll } from '../index.js';

const SAMPLE_CONFIG = {
  content: 'hello',
  apiKey: 'test-key',
  personaId: 'persona-123',
  baseURL: 'https://example.thinkfeel.dev/api/v1',
};

test('runAll invokes OpenAI-style and ThinkFeel runners in sequence', async () => {
  const callOrder = [];
  let openAiCompleted = false;

  const runOpenAI = async config => {
    callOrder.push('openai:start');

    assert.equal(config.personaId, SAMPLE_CONFIG.personaId);
    await new Promise(resolve => setTimeout(resolve, 10));
    openAiCompleted = true;

    callOrder.push('openai:end');
    return { finalReply: 'hello from openai' };
  };

  const runThinkFeel = async config => {
    assert.equal(openAiCompleted, true);
    callOrder.push('thinkfeel');

    assert.equal(config.personaId, SAMPLE_CONFIG.personaId);
    return { finalReply: 'hello from thinkfeel' };
  };

  const result = await runAll({ runOpenAI, runThinkFeel, log: () => {}, config: SAMPLE_CONFIG });
  assert.deepEqual(callOrder, ['openai:start', 'openai:end', 'thinkfeel']);
  assert.equal(result.thinkfeelResult.finalReply, 'hello from thinkfeel');
  assert.equal(result.openaiResult.finalReply, 'hello from openai');
});

test('main returns non-zero and sets process.exitCode when a runner fails', async () => {
  const originalExitCode = process.exitCode;
  process.exitCode = 0;

  let loggedMessage = '';

  try {
    const status = await main({
      log: () => {},
      config: SAMPLE_CONFIG,
      runOpenAI: async () => {
        throw new Error('simulated provider failure');
      },
      error: message => (loggedMessage = String(message)),
      runThinkFeel: async () => ({ finalReply: 'unused' }),
    });

    assert.equal(status, 1);
    assert.equal(process.exitCode, 1);
    assert.match(loggedMessage, /simulated provider failure/);
  } finally {
    process.exitCode = originalExitCode;
  }
});
