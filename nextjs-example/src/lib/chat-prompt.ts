import type { ChatMessage } from '@/src/lib/types';

export function formatMessagesAsCompletionPrompt(messages: ChatMessage[]) {
  const lines: string[] = [
    'You are in a text chat. Continue the conversation naturally as the assistant persona.',
    'Conversation history:',
  ];

  for (const message of messages) {
    if (message.role === 'system') {
      lines.push(`System: ${message.content}`);
      continue;
    }

    if (message.role === 'developer') {
      lines.push(`Developer: ${message.content}`);
      continue;
    }

    const label = message.role === 'assistant' ? 'Assistant' : 'User';
    lines.push(`${label}: ${message.content}`);
  }

  lines.push('Assistant:');
  return lines.join('\n');
}
