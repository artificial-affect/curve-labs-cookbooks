import { z } from 'zod';

const personaIdSchema = z.string().trim().min(1, 'personaId cannot be empty.').optional();

export const quickstartRequestSchema = z.object({
  personaId: personaIdSchema,
  prompt: z.string().trim().min(1, 'prompt is required.'),
});

export const personifyRequestSchema = z.object({
  personaId: personaIdSchema,
  raw: z.string().trim().min(1, 'raw is required.'),
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'developer']),
  content: z.string().trim().min(1, 'message content cannot be empty.'),
});

export const chatRequestSchema = z
  .object({
    personaId: personaIdSchema,
    messages: z.array(chatMessageSchema).min(1, 'messages must contain at least one item.'),
  })
  .superRefine((value, ctx) => {
    const last = value.messages[value.messages.length - 1];
    if (last?.role !== 'user') {
      ctx.addIssue({
        path: ['messages'],
        code: z.ZodIssueCode.custom,
        message: 'The last message role must be user.',
      });
    }
  });
