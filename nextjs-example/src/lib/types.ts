export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'developer';
export type ChatMessage = { role: ChatMessageRole; content: string };

export type QuickstartRequest = { personaId?: string; prompt: string };
export type QuickstartResponse = { text: string; model: string };

export type ChatRequest = { personaId?: string; messages: ChatMessage[] };
export type ChatResponse = { reply: string; model: string };

export type ApiErrorType = 'validation' | 'config' | 'provider';
export type ApiErrorResponse = { error: { type: ApiErrorType; message: string } };
