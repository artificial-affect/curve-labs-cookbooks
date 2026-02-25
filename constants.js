export const DEFAULT_CONTENT = "hey what's up?";
export const DEFAULT_THINKFEEL_BASE_URL = 'https://playground.curvelabs.org/api/v1';

function readRequiredEnvVar(env, key) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}.`);

  return value;
}

function readOptionalEnvVar(env, key) {
  const value = env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function loadRuntimeConfig(env = process.env) {
  return {
    apiKey: readRequiredEnvVar(env, 'CURVE_API_KEY'),
    personaId: readRequiredEnvVar(env, 'CURVE_PERSONA_ID'),
    content: readOptionalEnvVar(env, 'CURVE_PROMPT') ?? DEFAULT_CONTENT,
    baseURL: readOptionalEnvVar(env, 'THINKFEEL_BASE_URL') ?? DEFAULT_THINKFEEL_BASE_URL,
  };
}
