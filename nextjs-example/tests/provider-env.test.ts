import {
  DEFAULT_THINKFEEL_BASE_URL,
  resolvePersonaId,
  resolveThinkFeelConfig,
  createThinkFeelProvider,
} from '@/src/lib/thinkfeel-provider';
import { it, expect, describe } from 'vitest';

describe('ThinkFeel provider env configuration', () => {
  it('uses default base URL when THINKFEEL_BASE_URL is missing', () => {
    const env: NodeJS.ProcessEnv = { NODE_ENV: 'test', CURVE_API_KEY: 'test-key', CURVE_PERSONA_ID: 'persona-default' };

    const config = resolveThinkFeelConfig(env);
    expect(config.baseURL).toBe(DEFAULT_THINKFEEL_BASE_URL);
  });

  it('throws when CURVE_API_KEY is missing or blank', () => {
    const blankApiKeyEnv: NodeJS.ProcessEnv = { NODE_ENV: 'test', CURVE_API_KEY: '   ', CURVE_PERSONA_ID: 'persona-default' };
    expect(() => createThinkFeelProvider({ env: blankApiKeyEnv })).toThrowError(/CURVE_API_KEY/);

    const missingApiKeyEnv: NodeJS.ProcessEnv = { NODE_ENV: 'test', CURVE_PERSONA_ID: 'persona-default' };
    expect(() => createThinkFeelProvider({ env: missingApiKeyEnv })).toThrowError(/CURVE_API_KEY/);
  });

  it('prefers request personaId and falls back to CURVE_PERSONA_ID', () => {
    const env: NodeJS.ProcessEnv = { NODE_ENV: 'test', CURVE_PERSONA_ID: 'persona-from-env' };
    expect(resolvePersonaId('   persona-with-spaces   ', env)).toBe('persona-with-spaces');
    expect(resolvePersonaId('persona-from-request', env)).toBe('persona-from-request');
    expect(resolvePersonaId(undefined, env)).toBe('persona-from-env');
  });
});
