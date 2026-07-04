# Chat SDK Adaptation for ThinkFeel (Non-Stream)

ThinkFeel's OpenAI-compatible endpoint is `/api/v1/completions` and currently rejects `stream: true`.
A default Chat SDK project uses `streamText` and streaming UI transport, so adaptation is required.

## 1) `lib/ai/providers.ts`

Replace your provider config with `createOpenAI({ baseURL })` and your ThinkFeel API key.

```ts
import { createOpenAI } from '@ai-sdk/openai';
import { resolveThinkFeelConfig } from '@/src/lib/thinkfeel-provider';

const { apiKey, baseURL } = resolveThinkFeelConfig(process.env);
if (!apiKey) throw new Error('Missing THINKFEEL_API_KEY environment variable.');

export const thinkfeel = createOpenAI({
  apiKey,
  baseURL,
});
```

## 2) `lib/ai/models.ts`

Use completion-compatible model IDs. In ThinkFeel, `model` is your persona UUID.

```ts
import { thinkfeel } from './providers';

export function getModel(personaId: string) {
  return thinkfeel.completion(personaId);
}
```

## 3) `app/(chat)/api/chat/route.ts`

Replace streaming route code (`streamText`) with non-stream `generateText`.

### Before (typical Chat SDK pattern)

```ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model, messages });
  return result.toDataStreamResponse();
}
```

### After (ThinkFeel-compatible)

```ts
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { messages, personaId } = await req.json();
  const prompt = formatMessagesAsCompletionPrompt(messages);

  const { text } = await generateText({
    model: thinkfeel.completion(personaId),
    prompt,
  });

  return Response.json({ reply: text, model: personaId });
}
```

## 4) Client expectations

Your UI should wait for one full reply payload per request. Do not assume token streaming.

## Unsupported / Different vs default Chat SDK flow

- Streaming (`stream: true`)
- Tool-calling assumptions in route transport
- `max_tokens` support at the ThinkFeel endpoint
- `logprobs` support at the ThinkFeel endpoint

## Native `/personify`

`/api/v1/personify` is a ThinkFeel JSON endpoint rather than an OpenAI-compatible completion route. Call it with your ThinkFeel API key and a persona UUID that Playground has enabled for personify:

```ts
const response = await fetch(`${baseURL}/personify`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
  body: JSON.stringify({ personaId, raw }),
});

if (!response.ok) throw new Error(await response.text());

const personify = (await response.json()) as {
  chunks: string[];
  personified: string;
};
```

## Notes

- Keep server-side secret handling for `THINKFEEL_API_KEY`.
- Existing `CURVE_API_KEY` deployments can keep running as a legacy fallback, but new setup should use `THINKFEEL_API_KEY`.
- Keep explicit persona UUID validation in your API route.
- For multi-turn chat, include full history in each request.
