import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CONTENT,
  loadRuntimeConfig,
  DEFAULT_THINKFEEL_BASE_URL,
  resolveThinkFeelSdkBaseUrl,
} from '../constants.js';

test('loadRuntimeConfig fails fast when THINKFEEL_API_KEY is missing', () => {
  assert.throws(
    () => loadRuntimeConfig({ THINKFEEL_PERSONA_ID: 'persona-123' }),
    /Missing required environment variable: THINKFEEL_API_KEY\./
  );
});

test('loadRuntimeConfig fails fast when THINKFEEL_PERSONA_ID is missing', () => {
  assert.throws(
    () => loadRuntimeConfig({ THINKFEEL_API_KEY: 'test-key' }),
    /Missing required environment variable: THINKFEEL_PERSONA_ID\./
  );
});

test('loadRuntimeConfig treats blank required variables as missing', () => {
  assert.throws(
    () => loadRuntimeConfig({ THINKFEEL_API_KEY: '   ', THINKFEEL_PERSONA_ID: 'persona-123' }),
    /Missing required environment variable: THINKFEEL_API_KEY\./
  );
});

test('loadRuntimeConfig trims values and applies defaults for blank optional variables', () => {
  const config = loadRuntimeConfig({
    CURVE_PROMPT: '   ',
    THINKFEEL_BASE_URL: '   ',
    THINKFEEL_API_KEY: '  test-key  ',
    THINKFEEL_PERSONA_ID: '  persona-123  ',
  });

  assert.equal(config.apiKey, 'test-key');
  assert.equal(config.personaId, 'persona-123');
  assert.equal(config.content, DEFAULT_CONTENT);
  assert.equal(config.baseURL, DEFAULT_THINKFEEL_BASE_URL);
  assert.equal(config.sdkBaseUrl, 'https://playground.curvelabs.org');
});

test('loadRuntimeConfig returns explicit optional values when provided', () => {
  const config = loadRuntimeConfig({
    THINKFEEL_API_KEY: 'test-key',
    CURVE_PROMPT: 'custom prompt',
    THINKFEEL_PERSONA_ID: 'persona-123',
    THINKFEEL_BASE_URL: 'https://example.thinkfeel.dev/api/v1',
  });

  assert.deepEqual(config, {
    apiKey: 'test-key',
    content: 'custom prompt',
    personaId: 'persona-123',
    baseURL: 'https://example.thinkfeel.dev/api/v1',
    sdkBaseUrl: 'https://example.thinkfeel.dev',
    personifyRaw: undefined,
  });
});

test('resolveThinkFeelSdkBaseUrl strips /api/v1 only for native SDK calls', () => {
  assert.equal(resolveThinkFeelSdkBaseUrl('https://example.thinkfeel.dev/api/v1'), 'https://example.thinkfeel.dev');
  assert.equal(resolveThinkFeelSdkBaseUrl('https://example.thinkfeel.dev/api/v1/'), 'https://example.thinkfeel.dev');
  assert.equal(resolveThinkFeelSdkBaseUrl('https://example.thinkfeel.dev/custom'), 'https://example.thinkfeel.dev/custom');
});

test('loadRuntimeConfig falls back to legacy CURVE variables', () => {
  const config = loadRuntimeConfig({
    CURVE_API_KEY: 'legacy-key',
    CURVE_PERSONA_ID: 'legacy-persona',
  });

  assert.equal(config.apiKey, 'legacy-key');
  assert.equal(config.personaId, 'legacy-persona');
});

test('loadRuntimeConfig treats blank THINKFEEL variables as missing before legacy fallback', () => {
  const config = loadRuntimeConfig({
    THINKFEEL_API_KEY: '   ',
    THINKFEEL_PERSONA_ID: '   ',
    CURVE_API_KEY: 'legacy-key',
    CURVE_PERSONA_ID: 'legacy-persona',
  });

  assert.equal(config.apiKey, 'legacy-key');
  assert.equal(config.personaId, 'legacy-persona');
});

test('loadRuntimeConfig prefers THINKFEEL variables over legacy CURVE variables', () => {
  const config = loadRuntimeConfig({
    THINKFEEL_API_KEY: 'new-key',
    THINKFEEL_PERSONA_ID: 'new-persona',
    CURVE_API_KEY: 'legacy-key',
    CURVE_PERSONA_ID: 'legacy-persona',
  });

  assert.equal(config.apiKey, 'new-key');
  assert.equal(config.personaId, 'new-persona');
});
