import { ThinkFeel } from '@curvelabs.org/thinkfeel';

export async function testThinkFeel(config, options = {}) {
  const log = options.log ?? console.log;
  const ThinkFeelClient = options.ThinkFeel ?? ThinkFeel;

  const { apiKey, personaId, content, sdkBaseUrl, personifyRaw } = config;
  const thinkFeel = new ThinkFeelClient({ apiKey, personaId, baseUrl: sdkBaseUrl });

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

  let personifyResponse = null;
  if (personifyRaw) {
    if (typeof thinkFeel.personify !== 'function') {
      throw new Error('Installed @curvelabs.org/thinkfeel does not support personify. Update to 0.1.6 or newer.');
    }

    personifyResponse = await thinkFeel.personify({ raw: personifyRaw });
    log('> ThinkFeel SDK Personify Response:', {
      'Raw Response': personifyResponse,
      Personified: personifyResponse.personified,
    });
  }

  return {
    response,
    rateLimits,
    replyChoices,
    personifyResponse,
    finalReply: response.finalReply,
  };
}
