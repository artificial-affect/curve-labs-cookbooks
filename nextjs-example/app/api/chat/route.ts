import { NextResponse } from 'next/server';
import { runChat } from '@/src/lib/thinkfeel-service';
import { chatRequestSchema } from '@/src/lib/schemas';
import { mapErrorToResponse } from '@/src/lib/errors';
import { resolveServerEnv } from '@/src/lib/thinkfeel-provider';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { type: 'validation', message: 'Body must be valid JSON.' } }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request body.';
    return NextResponse.json({ error: { type: 'validation', message } }, { status: 400 });
  }

  try {
    const result = await runChat(parsed.data, { env: resolveServerEnv() });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
