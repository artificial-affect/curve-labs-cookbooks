import { ThinkFeel } from '@curvelabs.org/thinkfeel';

export async function testThinkFeel(config, options = {}) {
  const log = options.log ?? console.log;
  const ThinkFeelClient = options.ThinkFeel ?? ThinkFeel;

  const { apiKey, personaId, content } = config;
  const thinkFeel = new ThinkFeelClient({ apiKey, personaId });

  log('Testing ThinkFeel SDK...\n');

  const response = await thinkFeel.generate({ messages: [{ role: 'user', content }], includeVariations: true });
  const replyChoices = Array.isArray(response.replyChoices) ? response.replyChoices : [];
  const rateLimits = Array.isArray(response.rateLimits) ? response.rateLimits : [];

  log('> ThinkFeel SDK Response:', {
    'Raw Response': response,
    'Rate Limits': rateLimits,
    'Reply Choices': replyChoices,
    'Final Reply': response.finalReply,
  });

  return {
    response,
    rateLimits,
    replyChoices,
    finalReply: response.finalReply,
  };
}
