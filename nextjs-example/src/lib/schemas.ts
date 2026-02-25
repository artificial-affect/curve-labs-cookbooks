import { z } from 'zod';

const personaIdSchema = z.string().trim().min(1, 'personaId cannot be empty.').optional();

export const quickstartRequestSchema = z.object({
  prompt: z.string().trim().min(1, 'prompt is required.'),
  personaId: personaIdSchema,
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'developer']),
  content: z.string().trim().min(1, 'message content cannot be empty.'),
});

export const chatRequestSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1, 'messages must contain at least one item.'),
    personaId: personaIdSchema,
  })
  .superRefine((value, ctx) => {
    const last = value.messages[value.messages.length - 1];
    if (last?.role !== 'user') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['messages'],
        message: 'The last message role must be user.',
      });
    }
  });
