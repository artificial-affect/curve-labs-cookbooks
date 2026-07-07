# ThinkFeel Chat Cookbook (Next.js)

Accessible quickstart, multi-turn chat, and personify UI example for ThinkFeel.

## Important Warning

This project is a cookbook example and is not production-ready by default.

Current API routes (`/api/chat`, `/api/quickstart`, `/api/personify`) validate payloads but do not include user authentication or authorization checks.

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
   `THINKFEEL_API_KEY` in a managed secret store, key rotation, and environment-scoped credentials.
6. Privacy and compliance:
   Retention/deletion policy for prompts/replies and sensitive-content sanitization before persistence/analytics.
7. Cost and reliability safeguards:
   Token/request budgets, timeouts/retries/circuit breaking, and fallback behavior for provider outages.

## One-Click Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/curve-labs/curve-labs-cookbooks&root-directory=nextjs-example&project-name=thinkfeel-chat-cookbook&env=THINKFEEL_API_KEY,THINKFEEL_PERSONA_ID&envDescription=ThinkFeel%20API%20key%20and%20default%20persona%20UUID)

Required environment variables:

- `THINKFEEL_API_KEY`
- `THINKFEEL_PERSONA_ID`

Optional:

- `THINKFEEL_BASE_URL` (defaults to `https://playground.curvelabs.org/api/v1`)
- `THINKFEEL_PERSONIFY_RAW` (only used by optional live personify smoke tests)

Legacy fallback:

- Existing deployments that still define `CURVE_API_KEY` and `CURVE_PERSONA_ID` continue to work when the matching `THINKFEEL_*` variable is absent. Prefer `THINKFEEL_API_KEY` and `THINKFEEL_PERSONA_ID` for all new setup.

After deploy, open `/chat` for the full chat interface.

## Local Setup

For Codex or Claude Code setup, install the ThinkFeel Plugin from `https://docs.curvelabs.org/cli-agents`. It can populate `.env.local` without exposing API keys in chat.

```bash
cp env.example .env.local
npm install
npm run dev
```

Then open:

- `http://localhost:3000/` for quickstart
- `http://localhost:3000/chat` for multi-turn chat
- `http://localhost:3000/personify` for native personify

## Included Features

1. Accessible black/white shadcn-style UI with responsive left sidebar navigation for Quickstart, Chat, and Personify.
2. Multi-turn chat route (`POST /api/chat`) using full history and non-stream replies.
3. Quickstart route (`POST /api/quickstart`) using ThinkFeel-compatible completion calls.
4. Personify route (`POST /api/personify`) using the native ThinkFeel `/personify` endpoint.
5. Error envelopes and schema validation for all routes.

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

### `POST /api/personify`

Request:

```json
{ "raw": "Base response to rewrite", "personaId": "optional-uuid" }
```

Response:

```json
{ "personified": "...", "chunks": ["..."], "model": "persona-uuid" }
```

Error envelope (all routes):

```json
{ "error": { "type": "validation | config | provider", "message": "..." } }
```

## Notes

- ThinkFeel `/completions` is non-stream, so this cookbook intentionally avoids streaming route patterns.
- ThinkFeel `/personify` is a native JSON endpoint, not an OpenAI-compatible completion endpoint.
- Playground returns 404 when `/personify` is called with a persona ID that is not enabled for personify.
- Tool-calling and some OpenAI-specific parameters are not currently supported by ThinkFeel `/completions`.
- Migration details for existing Chat SDK projects: `docs/chat-sdk-adaptation.md`.
