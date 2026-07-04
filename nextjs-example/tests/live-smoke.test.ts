import { it, expect, describe } from 'vitest';
import { runChat, runPersonify, runQuickstart } from '@/src/lib/thinkfeel-service';
import { resolveServerEnv, resolveThinkFeelConfig } from '@/src/lib/thinkfeel-provider';

const runtimeEnv = resolveServerEnv();
const { apiKey, defaultPersonaId: personaId } = resolveThinkFeelConfig(runtimeEnv);

const hasRequiredEnv = Boolean(apiKey && personaId);
const describeLive = hasRequiredEnv ? describe : describe.skip;
const personifyRaw = runtimeEnv.THINKFEEL_PERSONIFY_RAW?.trim();
const itPersonify = hasRequiredEnv && personifyRaw ? it : it.skip;

describeLive('Live ThinkFeel smoke checks', () => {
  it('returns non-empty quickstart text and chat reply with env persona', async () => {
    const quickstart = await runQuickstart({ prompt: 'Reply with a short greeting.' });

    expect(quickstart.model).toBe(personaId);
    expect(quickstart.text.trim().length).toBeGreaterThan(0);

    const chat = await runChat({
      messages: [{ role: 'user', content: 'Give me a 5-word greeting.' }],
    });

    expect(chat.model).toBe(personaId);
    expect(chat.reply.trim().length).toBeGreaterThan(0);
  }, 60_000);

  itPersonify(
    'returns non-empty personified text when THINKFEEL_PERSONIFY_RAW is set',
    async () => {
      const personify = await runPersonify({ raw: personifyRaw ?? '' });

      expect(personify.model).toBe(personaId);
      expect(personify.personified.trim().length).toBeGreaterThan(0);
    },
    60_000
  );
});
