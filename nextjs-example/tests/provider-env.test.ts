import {
  DEFAULT_THINKFEEL_BASE_URL,
  resolvePersonaId,
  resolveThinkFeelConfig,
  createThinkFeelProvider,
} from '@/src/lib/thinkfeel-provider';
import { it, expect, describe } from 'vitest';

describe('ThinkFeel provider env configuration', () => {
  it('uses default base URL when THINKFEEL_BASE_URL is missing', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      THINKFEEL_API_KEY: 'test-key',
      THINKFEEL_PERSONA_ID: 'persona-default',
    };

    const config = resolveThinkFeelConfig(env);
    expect(config.baseURL).toBe(DEFAULT_THINKFEEL_BASE_URL);
  });

  it('throws when THINKFEEL_API_KEY is missing or blank', () => {
    const blankApiKeyEnv: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      THINKFEEL_API_KEY: '   ',
      THINKFEEL_PERSONA_ID: 'persona-default',
    };
    expect(() => createThinkFeelProvider({ env: blankApiKeyEnv })).toThrowError(/THINKFEEL_API_KEY/);

    const missingApiKeyEnv: NodeJS.ProcessEnv = { NODE_ENV: 'test', THINKFEEL_PERSONA_ID: 'persona-default' };
    expect(() => createThinkFeelProvider({ env: missingApiKeyEnv })).toThrowError(/THINKFEEL_API_KEY/);
  });

  it('prefers request personaId and falls back to THINKFEEL_PERSONA_ID', () => {
    const env: NodeJS.ProcessEnv = { NODE_ENV: 'test', THINKFEEL_PERSONA_ID: 'persona-from-env' };
    expect(resolvePersonaId('   persona-with-spaces   ', env)).toBe('persona-with-spaces');
    expect(resolvePersonaId('persona-from-request', env)).toBe('persona-from-request');
    expect(resolvePersonaId(undefined, env)).toBe('persona-from-env');
  });

  it('falls back to legacy CURVE environment variables', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      CURVE_API_KEY: 'legacy-key',
      CURVE_PERSONA_ID: 'legacy-persona',
    };

    const config = resolveThinkFeelConfig(env);
    expect(config.apiKey).toBe('legacy-key');
    expect(config.defaultPersonaId).toBe('legacy-persona');
  });

  it('treats blank THINKFEEL environment variables as missing before legacy fallback', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      THINKFEEL_API_KEY: '   ',
      THINKFEEL_PERSONA_ID: '   ',
      CURVE_API_KEY: 'legacy-key',
      CURVE_PERSONA_ID: 'legacy-persona',
    };

    const config = resolveThinkFeelConfig(env);
    expect(config.apiKey).toBe('legacy-key');
    expect(config.defaultPersonaId).toBe('legacy-persona');
  });

  it('prefers THINKFEEL environment variables over legacy CURVE variables', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'test',
      THINKFEEL_API_KEY: 'new-key',
      THINKFEEL_PERSONA_ID: 'new-persona',
      CURVE_API_KEY: 'legacy-key',
      CURVE_PERSONA_ID: 'legacy-persona',
    };

    const config = resolveThinkFeelConfig(env);
    expect(config.apiKey).toBe('new-key');
    expect(config.defaultPersonaId).toBe('new-persona');
  });
});
