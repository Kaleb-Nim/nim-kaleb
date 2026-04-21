import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';

const MAX_TEXT = 8000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Body {
  sessionId?: unknown;
  role?: unknown;
  text?: unknown;
  turnIndex?: unknown;
}

export async function POST(req: Request) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'analytics disabled' }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const { sessionId, role, text } = body;

  if (
    typeof sessionId !== 'string' ||
    !UUID_RE.test(sessionId) ||
    (role !== 'user' && role !== 'assistant') ||
    typeof text !== 'string'
  ) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const clean = text.slice(0, MAX_TEXT);
  const turnIndex =
    typeof body.turnIndex === 'number' ? Math.floor(body.turnIndex) : 0;

  try {
    await sql`
      insert into transcripts (session_id, role, text, turn_index)
      values (${sessionId}, ${role}, ${clean}, ${turnIndex})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics/transcript]', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
