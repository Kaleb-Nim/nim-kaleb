import { NextRequest, NextResponse } from 'next/server';

const STT_SERVER_URL = process.env.STT_SERVER_URL ?? 'http://localhost:8000';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Use Groq Whisper API if configured (free tier, no GPU needed)
    if (GROQ_API_KEY) {
      return await groqTranscribe(formData);
    }

    // Fallback: proxy to self-hosted STT server
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function groqTranscribe(formData: FormData) {
  const audioFile = formData.get('audio');
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json({ error: 'No audio file' }, { status: 400 });
  }

  // Determine filename from the uploaded file or default
  const fileName = audioFile instanceof File ? audioFile.name : 'audio.wav';

  // Groq expects the field named "file"
  const groqForm = new FormData();
  groqForm.append('file', new Blob([await audioFile.arrayBuffer()], { type: audioFile.type || 'audio/wav' }), fileName);
  groqForm.append('model', 'whisper-large-v3-turbo');
  groqForm.append('language', 'en');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: groqForm,
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Groq STT error: ${text}` }, { status: res.status });
  }

  const json = await res.json();
  return NextResponse.json({ transcript: json.text ?? '' });
}
