import { generateText } from 'ai';
import { AppError } from '@/src/lib/errors';
import { formatMessagesAsCompletionPrompt } from '@/src/lib/chat-prompt';
import type { ChatRequest, ChatResponse, QuickstartRequest, QuickstartResponse } from '@/src/lib/types';
import { getThinkFeelCompletionModel, resolvePersonaId, createThinkFeelProvider } from '@/src/lib/thinkfeel-provider';

type ServiceOptions = { fetch?: typeof fetch; env?: NodeJS.ProcessEnv };

function requirePersonaId(personaId: string | undefined) {
  if (!personaId) {
    throw new AppError('config', 'Missing personaId. Provide personaId in the request or set THINKFEEL_PERSONA_ID.', 500);
  }

  return personaId;
}

export async function runQuickstart(request: QuickstartRequest, options: ServiceOptions = {}): Promise<QuickstartResponse> {
  try {
    const personaId = requirePersonaId(resolvePersonaId(request.personaId, options.env));
    const model = getThinkFeelCompletionModel(personaId, options);

    const { text } = await generateText({ model, prompt: request.prompt });
    return { text, model: personaId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.message.includes('THINKFEEL_API_KEY')) throw new AppError('config', error.message, 500);

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
    if (error instanceof Error && error.message.includes('THINKFEEL_API_KEY')) throw new AppError('config', error.message, 500);

    throw new AppError('provider', error instanceof Error ? error.message : 'Provider call failed.', 502);
  }
}
