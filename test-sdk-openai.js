import { createOpenAI } from '@ai-sdk/openai';

export async function testAISDK(config, options = {}) {
  const log = options.log ?? console.log;
  const createProvider = options.createProvider ?? (providerOptions => createOpenAI(providerOptions));

  const { apiKey, personaId, content, baseURL } = config;

  log('Testing OpenAI-Style SDK...\n');

  const openaiModel = createProvider({ apiKey, baseURL }).completion(personaId);
  const openaiPrompt = [{ role: 'user', content: [{ type: 'text', text: content }] }];

  const openaiResponse = await openaiModel.doGenerate({ prompt: openaiPrompt });
  if (!openaiResponse.response) throw new Error('OpenAI-style SDK returned no response.');

  const firstContent = openaiResponse.content?.[0];
  const finalReply = firstContent?.type === 'text' ? firstContent.text : 'No text';

  log('> OpenAI-Style SDK Response:', {
    'Final Reply': finalReply,
    'Raw Response': openaiResponse,
    'Reply Choices': openaiResponse.response.body?.choices,
  });

  return {
    finalReply,
    response: openaiResponse,
  };
}
