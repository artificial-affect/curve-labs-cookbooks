export const DEFAULT_CONTENT = "hey what's up?";
export const DEFAULT_THINKFEEL_BASE_URL = 'https://playground.curvelabs.org/api/v1';

const THINKFEEL_API_V1_SUFFIX = '/api/v1';

function readOptionalEnvVar(env, key) {
  const value = env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function readRequiredEnvVar(env, key, legacyKey) {
  const value = readOptionalEnvVar(env, key) ?? readOptionalEnvVar(env, legacyKey);
  if (!value) throw new Error(`Missing required environment variable: ${key}.`);
  return value;
}

/**
 * When the OpenAI-compatible base URL includes /api/v1, the native SDK needs the origin only.
 */
export function resolveThinkFeelSdkBaseUrl(baseURL) {
  const normalizedBaseURL = baseURL.replace(/\/+$/, '');
  if (normalizedBaseURL.endsWith(THINKFEEL_API_V1_SUFFIX)) return normalizedBaseURL.slice(0, -THINKFEEL_API_V1_SUFFIX.length);

  return normalizedBaseURL;
}

export function loadRuntimeConfig(env = process.env) {
  const baseURL = readOptionalEnvVar(env, 'THINKFEEL_BASE_URL') ?? DEFAULT_THINKFEEL_BASE_URL;

  return {
    baseURL,
    sdkBaseUrl: resolveThinkFeelSdkBaseUrl(baseURL),
    personifyRaw: readOptionalEnvVar(env, 'THINKFEEL_PERSONIFY_RAW'),
    content: readOptionalEnvVar(env, 'CURVE_PROMPT') ?? DEFAULT_CONTENT,
    apiKey: readRequiredEnvVar(env, 'THINKFEEL_API_KEY', 'CURVE_API_KEY'),
    personaId: readRequiredEnvVar(env, 'THINKFEEL_PERSONA_ID', 'CURVE_PERSONA_ID'),
  };
}
