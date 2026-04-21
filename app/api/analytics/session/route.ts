import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';

interface Body {
  event?: string;
  sessionId?: unknown;
  durationMs?: unknown;
  status?: unknown;
  errorCode?: unknown;
  errorMessage?: unknown;
}

export async function POST(req: Request) {
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'analytics disabled' }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const event = body.event;

  try {
    if (event === 'start') {
      const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 512);
      const rows = (await sql`
        insert into sessions (user_agent)
        values (${userAgent})
        returning id
      `) as Array<{ id: string }>;
      const row = rows[0];
      return NextResponse.json({ sessionId: row.id });
    }

    if (event === 'end') {
      const sessionId = body.sessionId;
      if (typeof sessionId !== 'string' || sessionId.length === 0) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
      }
      const durationMs =
        typeof body.durationMs === 'number' ? Math.floor(body.durationMs) : null;
      const status =
        typeof body.status === 'string' &&
        ['active', 'ended', 'error', 'abandoned'].includes(body.status)
          ? body.status
          : 'ended';
      const errorCode =
        typeof body.errorCode === 'string' ? body.errorCode.slice(0, 256) : null;
      const errorMessage =
        typeof body.errorMessage === 'string'
          ? body.errorMessage.slice(0, 1024)
          : body.errorMessage != null
            ? String(body.errorMessage).slice(0, 1024)
            : null;

      await sql`
        update sessions
        set ended_at     = now(),
            duration_ms  = ${durationMs},
            status       = ${status},
            error_code   = ${errorCode},
            error_message = ${errorMessage}
        where id = ${sessionId} and ended_at is null
      `;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'unknown event' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
