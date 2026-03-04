import { NextRequest, NextResponse } from 'next/server';

const TTS_SERVER_URL = process.env.TTS_SERVER_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(`${TTS_SERVER_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json({ error: text }, { status: upstream.status });
  }

  const wavBytes = await upstream.arrayBuffer();
  return new NextResponse(wavBytes, {
    headers: { 'Content-Type': 'audio/wav' },
  });
}
