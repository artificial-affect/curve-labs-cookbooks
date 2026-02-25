# ThinkFeel Chat Cookbook (Next.js)

Accessible, multi-turn chat UI example for ThinkFeel using the Vercel AI SDK (`@ai-sdk/openai`) with a ThinkFeel `baseURL`.

## Important Warning

This project is a cookbook example and is not production-ready by default.

Current API routes (`/api/chat`, `/api/quickstart`) validate payloads but do not include user authentication or authorization checks.

Before production use, implement and verify:

1. Route protection:
   Auth on all API routes (session/JWT/service auth) and tenant/user-level authorization.
2. Abuse protection:
   Rate limiting, request throttling, and bot/abuse controls at edge and app layers.
3. Security controls:
   CSRF/CORS policy review (where applicable), stricter request size limits, and defensive headers via your hosting stack.
4. Observability:
   Structured logs, request IDs, error reporting, and alerting around provider/API failures.
5. Secret and environment hygiene:
   `CURVE_API_KEY` in a managed secret store, key rotation, and environment-scoped credentials.
6. Privacy and compliance:
   Retention/deletion policy for prompts/replies and sensitive-content sanitization before persistence/analytics.
7. Cost and reliability safeguards:
   Token/request budgets, timeouts/retries/circuit breaking, and fallback behavior for provider outages.

## One-Click Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/curve-labs/curve-labs-cookbooks&root-directory=nextjs-thinkfeel-ai-sdk-example&project-name=thinkfeel-chat-cookbook&env=CURVE_API_KEY,CURVE_PERSONA_ID&envDescription=ThinkFeel%20API%20key%20and%20default%20persona%20UUID)

Required environment variables:

- `CURVE_API_KEY`
- `CURVE_PERSONA_ID`

Optional:

- `THINKFEEL_BASE_URL` (defaults to `https://playground.curvelabs.org/api/v1`)

After deploy, open `/chat` for the full chat interface.

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open:

- `http://localhost:3000/` for quickstart
- `http://localhost:3000/chat` for multi-turn chat

## Included Features

1. Accessible black/white shadcn-style UI with responsive left sidebar navigation for Quickstart + Chat.
2. Multi-turn chat route (`POST /api/chat`) using full history and non-stream replies.
3. Quickstart route (`POST /api/quickstart`) using ThinkFeel-compatible completion calls.
4. Error envelopes and schema validation for both routes.

## Scripts

```bash
npm run dev
npm run test
npm run typecheck
npm run build
```

Optional live check against real credentials:

```bash
npm run test:live
```

## API Contracts

### `POST /api/quickstart`

Request:

```json
{ "prompt": "hello", "personaId": "optional-uuid" }
```

Response:

```json
{ "text": "...", "model": "persona-uuid" }
```

### `POST /api/chat`

Request:

```json
{
  "messages": [{ "role": "user", "content": "hello" }],
  "personaId": "optional-uuid"
}
```

Response:

```json
{ "reply": "...", "model": "persona-uuid" }
```

Error envelope (both routes):

```json
{ "error": { "type": "validation | config | provider", "message": "..." } }
```

## Notes

- ThinkFeel `/completions` is non-stream, so this cookbook intentionally avoids streaming route patterns.
- Tool-calling and some OpenAI-specific parameters are not currently supported by ThinkFeel `/completions`.
- Migration details for existing Chat SDK projects: `docs/chat-sdk-adaptation.md`.
