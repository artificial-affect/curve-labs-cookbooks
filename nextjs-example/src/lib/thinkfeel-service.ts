import { generateText } from 'ai';
import { AppError } from '@/src/lib/errors';
import { formatMessagesAsCompletionPrompt } from '@/src/lib/chat-prompt';
import type { ChatRequest, ChatResponse, PersonifyRequest, QuickstartRequest, QuickstartResponse } from '@/src/lib/types';
import {
  resolvePersonaId,
  getThinkFeelApiUrl,
  resolveThinkFeelConfig,
  createThinkFeelProvider,
  getThinkFeelCompletionModel,
} from '@/src/lib/thinkfeel-provider';

type ServiceOptions = { fetch?: typeof fetch; env?: NodeJS.ProcessEnv };

function requirePersonaId(personaId: string | undefined) {
  if (!personaId) {
    throw new AppError('config', 'Missing personaId. Provide personaId in the request or set THINKFEEL_PERSONA_ID.', 500);
  }

  return personaId;
}

function requireApiKey(apiKey: string | undefined) {
  if (!apiKey) throw new AppError('config', 'Missing THINKFEEL_API_KEY environment variable.', 500);
  return apiKey;
}

async function readProviderError(response: Response) {
  const fallback = `ThinkFeel request failed with status ${response.status}.`;
  const text = await response.text();
  if (!text) return fallback;

  try {
    const body = JSON.parse(text) as { error?: unknown; message?: unknown };
    const message = typeof body.message === 'string' ? body.message : typeof body.error === 'string' ? body.error : '';
    return message || text;
  } catch {
    return text;
  }
}

function getFetch(options: ServiceOptions) {
  return options.fetch ?? fetch;
}

export async function runQuickstart(request: QuickstartRequest, options: ServiceOptions = {}): Promise<QuickstartResponse> {
  try {
    const personaId = requirePersonaId(resolvePersonaId(request.personaId, options.env));
    const model = getThinkFeelCompletionModel(personaId, options);

    const { text } = await generateText({ model, prompt: request.prompt });
    return { text, model: personaId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.message.includes('THINKFEEL_API_KEY'))
      throw new AppError('config', error.message, 500);

    throw new AppError('provider', error instanceof Error ? error.message : 'Provider call failed.', 502);
  }
}

export async function runPersonify(request: PersonifyRequest, options: ServiceOptions = {}) {
  try {
    const personaId = requirePersonaId(resolvePersonaId(request.personaId, options.env));
    const { apiKey } = resolveThinkFeelConfig(options.env);
    const response = await getFetch(options)(getThinkFeelApiUrl('/personify', options.env), {
      method: 'POST',
      body: JSON.stringify({ raw: request.raw, personaId }),
      headers: { 'Content-Type': 'application/json', 'x-api-key': requireApiKey(apiKey) },
    });

    if (!response.ok) throw new AppError('provider', await readProviderError(response), 502);

    const body = (await response.json()) as { chunks?: unknown; personified?: unknown };
    if (typeof body.personified !== 'string') throw new AppError('provider', 'Personify response was missing text.', 502);

    const chunks = Array.isArray(body.chunks) ? body.chunks.filter(chunk => typeof chunk === 'string') : [];
    return { personified: body.personified, chunks, model: personaId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('provider', error instanceof Error ? error.message : 'Provider call failed.', 502);
  }
}

export async function runChat(request: ChatRequest, options: ServiceOptions = {}): Promise<ChatResponse> {
  try {
    const personaId = requirePersonaId(resolvePersonaId(request.personaId, options.env));
    createThinkFeelProvider(options); // Ensure provider config fails fast before prompt work.

    const prompt = formatMessagesAsCompletionPrompt(request.messages);
    const model = getThinkFeelCompletionModel(personaId, options);
    const { text } = await generateText({ model, prompt });

    return { reply: text, model: personaId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.message.includes('THINKFEEL_API_KEY'))
      throw new AppError('config', error.message, 500);

    throw new AppError('provider', error instanceof Error ? error.message : 'Provider call failed.', 502);
  }
}
