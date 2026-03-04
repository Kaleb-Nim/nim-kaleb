import { NextRequest, NextResponse } from 'next/server';

const STT_SERVER_URL = process.env.STT_SERVER_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const upstream = await fetch(`${STT_SERVER_URL}/stt`, {
    method: 'POST',
    body: formData,
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json({ error: text }, { status: upstream.status });
  }

  const json = await upstream.json();
  return NextResponse.json(json);
}
