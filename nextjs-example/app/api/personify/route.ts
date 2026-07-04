import { NextResponse } from 'next/server';
import { mapErrorToResponse } from '@/src/lib/errors';
import { personifyRequestSchema } from '@/src/lib/schemas';
import { runPersonify } from '@/src/lib/thinkfeel-service';
import { resolveServerEnv } from '@/src/lib/thinkfeel-provider';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { type: 'validation', message: 'Body must be valid JSON.' } }, { status: 400 });
  }

  const parsed = personifyRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request body.';
    return NextResponse.json({ error: { type: 'validation', message } }, { status: 400 });
  }

  try {
    const result = await runPersonify(parsed.data, { env: resolveServerEnv() });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
