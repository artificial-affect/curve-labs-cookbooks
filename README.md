# Curve Labs Cookbooks

## Important Warning

These cookbooks are examples and starter references, not production-ready applications.

Before exposing any endpoint publicly, add and validate at minimum:

1. Authentication and authorization on every API route (do not expose provider-backed routes anonymously).
2. Rate limiting and abuse protection (per-IP and per-user quotas, burst controls).
3. Input/output guardrails and stricter validation for all externally supplied fields.
4. Centralized logging, monitoring, and alerting for provider errors and unusual traffic.
5. Secret management and key rotation (never commit secrets; scope API keys to least privilege).
6. Data handling controls (retention policy, PII redaction, privacy/legal review).

This repository contains two cookbook examples:

1. Root SDK runner (plain Node.js scripts in this directory)

2. `nextjs-example` (Next.js + TypeScript API cookbook)

## Root SDK runner

This runner is intended for local testing and SDK wiring checks. It is not a deployed service and has no built-in user auth, tenancy isolation, or runtime abuse controls.

1. Set environment variables (copy from `.env.example` if needed):

```bash
export CURVE_API_KEY=your_thinkfeel_api_key
export CURVE_PERSONA_ID=your_persona_uuid
```

Optional:

- `CURVE_PROMPT` (default: `hey what's up?`)
- `THINKFEEL_BASE_URL` (default: `https://playground.curvelabs.org/api/v1`)

2. Install and run:

```bash
npm install
npm start
```

3. Run offline tests:

```bash
npm test
```

## Next.js cookbook

See [`nextjs-example/README.md`](nextjs-example/README.md) for setup, tests, and optional live smoke checks.

## License

MIT. See [`LICENSE`](LICENSE).
