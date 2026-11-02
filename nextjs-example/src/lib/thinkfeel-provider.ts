import { createOpenAI } from '@ai-sdk/openai';
type ProviderOptions = { fetch?: typeof fetch; env?: NodeJS.ProcessEnv };
export const DEFAULT_THINKFEEL_BASE_URL = 'https://playground.curvelabs.org/api/v1';

export function resolveServerEnv(env?: NodeJS.ProcessEnv) {
  return env ?? process.env;
}

function readEnvVar(env: NodeJS.ProcessEnv, key: string) {
  return env[key]?.trim() || undefined;
}

function readEnvVarWithFallback(env: NodeJS.ProcessEnv, key: string, legacyKey: string) {
  return readEnvVar(env, key) ?? readEnvVar(env, legacyKey);
}

export function resolveThinkFeelConfig(env?: NodeJS.ProcessEnv) {
  const runtimeEnv = resolveServerEnv(env);
  const apiKey = readEnvVarWithFallback(runtimeEnv, 'THINKFEEL_API_KEY', 'CURVE_API_KEY');
  const defaultPersonaId = readEnvVarWithFallback(runtimeEnv, 'THINKFEEL_PERSONA_ID', 'CURVE_PERSONA_ID');
  const baseURL = (readEnvVar(runtimeEnv, 'THINKFEEL_BASE_URL') ?? DEFAULT_THINKFEEL_BASE_URL).replace(/\/+$/, '');

  return { apiKey, defaultPersonaId, baseURL };
}

export function resolvePersonaId(personaId: string | undefined, env?: NodeJS.ProcessEnv) {
  return personaId?.trim() || resolveThinkFeelConfig(env).defaultPersonaId;
}

export function createThinkFeelProvider(options: ProviderOptions = {}) {
  const { apiKey, baseURL } = resolveThinkFeelConfig(options.env);
  if (!apiKey) throw new Error('Missing THINKFEEL_API_KEY environment variable.');

  return createOpenAI({ apiKey, baseURL, fetch: options.fetch });
}

export function getThinkFeelApiUrl(path: string, env?: NodeJS.ProcessEnv) {
  return `${resolveThinkFeelConfig(env).baseURL}/${path.replace(/^\/+/, '')}`;
}

export function getThinkFeelCompletionModel(personaId: string, options: ProviderOptions = {}) {
  return createThinkFeelProvider(options).completion(personaId);
}
