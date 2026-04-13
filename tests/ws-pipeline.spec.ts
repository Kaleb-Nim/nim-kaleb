/**
 * Backend/WebSocket pipeline tests for the Bun WS server and DashScope APIs.
 *
 * Tests:
 *   1. WS server health endpoint
 *   2. WebSocket upgrade and session.start handshake
 *   3. DashScope TTS WebSocket connection and session init
 *   4. DashScope ASR WebSocket connection and session init
 *   5. DashScope LLM streaming (qwen-plus via OpenAI-compatible API)
 *   6. TTS text-to-audio round-trip (send text, receive PCM audio)
 *   7. Invalid message handling on WS server
 *
 * Requires:
 *   - WS server running on localhost:8080 (`cd ws-server && bun run src/index.ts`)
 *   - DASHSCOPE_API_KEY set in ws-server/.env.local
 *   - DASHSCOPE_VOICE_ID set in ws-server/.env.local
 */

import { test, expect } from '@playwright/test';

const WS_URL = 'ws://localhost:8080';
const DASHSCOPE_WS_BASE = 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime';

// Helper: get API key from env (tests run from project root, load ws-server env)
function getDashScopeApiKey(): string {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('DASHSCOPE_API_KEY not set — add to .env.local or ws-server/.env.local');
  return key;
}

function getDashScopeVoiceId(): string {
  const id = process.env.DASHSCOPE_VOICE_ID;
  if (!id) throw new Error('DASHSCOPE_VOICE_ID not set');
  return id;
}

// Helper: open a raw WebSocket and collect messages
function openWs(url: string, protocols?: string[]): Promise<{
  ws: WebSocket;
  messages: string[];
  waitForMessage: (predicate: (msg: unknown) => boolean, timeoutMs?: number) => Promise<unknown>;
  close: () => void;
}> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, protocols);
    const messages: string[] = [];
    const listeners: Array<{ predicate: (msg: unknown) => boolean; resolve: (v: unknown) => void; reject: (e: Error) => void }> = [];

    ws.onopen = () => resolve({
      ws,
      messages,
      waitForMessage(predicate, timeoutMs = 10_000) {
        return new Promise((res, rej) => {
          // Check already received messages
          for (const m of messages) {
            try {
              const parsed = JSON.parse(m);
              if (predicate(parsed)) return res(parsed);
            } catch { /* skip non-JSON */ }
          }
          const timer = setTimeout(() => rej(new Error('waitForMessage timeout')), timeoutMs);
          listeners.push({
            predicate,
            resolve: (v) => { clearTimeout(timer); res(v); },
            reject: (e) => { clearTimeout(timer); rej(e); },
          });
        });
      },
      close: () => ws.close(),
    });

    ws.onmessage = (e) => {
      const data = typeof e.data === 'string' ? e.data : '';
      messages.push(data);
      try {
        const parsed = JSON.parse(data);
        for (let i = listeners.length - 1; i >= 0; i--) {
          if (listeners[i].predicate(parsed)) {
            listeners[i].resolve(parsed);
            listeners.splice(i, 1);
          }
        }
      } catch { /* non-JSON */ }
    };

    ws.onerror = () => reject(new Error(`WebSocket connection failed: ${url}`));

    setTimeout(() => reject(new Error(`WebSocket open timeout: ${url}`)), 5_000);
  });
}

// ── WS Server Tests ──────────────��──────────────────────────────────────────

test.describe('WS server', () => {
  test('GET /health returns ok', async () => {
    const res = await fetch(`http://localhost:8080/health`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('ok');
    console.log('[ws-server] health check passed');
  });

  test('WebSocket upgrade on /ws succeeds', async () => {
    const { ws, close } = await openWs(`${WS_URL}/ws`);
    expect(ws.readyState).toBe(WebSocket.OPEN);
    console.log('[ws-server] WebSocket upgrade succeeded');
    close();
  });

  test('session.start returns session.ready', async () => {
    const { ws, waitForMessage, close } = await openWs(`${WS_URL}/ws`);

    ws.send(JSON.stringify({ type: 'session.start' }));

    const msg = await waitForMessage(
      (m: unknown) => (m as { type?: string }).type === 'session.ready',
      15_000
    );
    expect(msg).toBeDefined();
    console.log('[ws-server] session.start -> session.ready handshake complete');
    close();
  });

  test('invalid message returns error', async () => {
    const { ws, waitForMessage, close } = await openWs(`${WS_URL}/ws`);

    ws.send(JSON.stringify({ type: 'bogus.message' }));

    const msg = await waitForMessage(
      (m: unknown) => (m as { type?: string }).type === 'error',
      5_000
    ) as { type: string; message: string };
    expect(msg.message).toContain('Unknown message type');
    console.log('[ws-server] invalid message correctly rejected:', msg.message);
    close();
  });

  test('malformed JSON returns error', async () => {
    const { ws, waitForMessage, close } = await openWs(`${WS_URL}/ws`);

    ws.send('not-json{{{');

    const msg = await waitForMessage(
      (m: unknown) => (m as { type?: string }).type === 'error',
      5_000
    ) as { type: string; message: string };
    expect(msg.message).toContain('Invalid JSON');
    console.log('[ws-server] malformed JSON correctly rejected');
    close();
  });
});

// ── DashScope TTS API Tests ─────────────────────────────���───────────────────

test.describe('DashScope TTS API', () => {
  test.setTimeout(30_000);

  test('TTS WebSocket connects and accepts session.update', async () => {
    const apiKey = getDashScopeApiKey();
    const voiceId = getDashScopeVoiceId();
    const url = `${DASHSCOPE_WS_BASE}?model=qwen3-tts-vc-realtime-2026-01-15`;

    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(url, {
        // @ts-expect-error — Bun WebSocket headers
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      socket.onopen = () => resolve(socket);
      socket.onerror = () => reject(new Error('TTS WebSocket connection failed'));
      setTimeout(() => reject(new Error('TTS connection timeout')), 10_000);
    });

    expect(ws.readyState).toBe(WebSocket.OPEN);
    console.log('[tts] WebSocket connected to DashScope');

    // Send session.update
    ws.send(JSON.stringify({
      type: 'session.update',
      event_id: 'evt_test_init',
      session: {
        mode: 'server_commit',
        voice: voiceId,
        language_type: 'en',
        response_format: 'pcm',
        sample_rate: 24000,
      },
    }));

    // Wait for session.updated or session.created response
    const response = await new Promise<string>((resolve, reject) => {
      ws.onmessage = (e) => {
        const data = typeof e.data === 'string' ? e.data : '';
        resolve(data);
      };
      setTimeout(() => reject(new Error('No session response from TTS')), 10_000);
    });

    const parsed = JSON.parse(response);
    expect(['session.updated', 'session.created']).toContain(parsed.type);
    console.log('[tts] session init response:', parsed.type);
    ws.close();
  });

  test('TTS synthesizes audio from text input', async () => {
    const apiKey = getDashScopeApiKey();
    const voiceId = getDashScopeVoiceId();
    const url = `${DASHSCOPE_WS_BASE}?model=qwen3-tts-vc-realtime-2026-01-15`;

    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(url, {
        // @ts-expect-error — Bun WebSocket headers
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      socket.onopen = () => resolve(socket);
      socket.onerror = () => reject(new Error('TTS connection failed'));
      setTimeout(() => reject(new Error('TTS connection timeout')), 10_000);
    });

    // Init session
    ws.send(JSON.stringify({
      type: 'session.update',
      event_id: 'evt_test_init',
      session: {
        mode: 'server_commit',
        voice: voiceId,
        language_type: 'en',
        response_format: 'pcm',
        sample_rate: 24000,
      },
    }));

    // Wait for session ack
    await new Promise<void>((resolve) => {
      ws.onmessage = () => resolve();
      setTimeout(resolve, 2_000);
    });

    // Send text for synthesis
    const audioChunks: string[] = [];
    let gotDone = false;

    ws.onmessage = (e) => {
      const data = typeof e.data === 'string' ? e.data : '';
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'response.audio.delta' && msg.delta) {
          audioChunks.push(msg.delta);
        }
        if (msg.type === 'response.done') {
          gotDone = true;
        }
      } catch { /* skip */ }
    };

    ws.send(JSON.stringify({
      type: 'input_text_buffer.append',
      event_id: 'evt_test_text',
      text: 'Hello, I am Kaleb. Welcome to my portfolio.',
    }));

    ws.send(JSON.stringify({
      type: 'session.finish',
      event_id: 'evt_test_finish',
    }));

    // Wait for audio chunks and response.done
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (gotDone && audioChunks.length > 0) {
          clearInterval(check);
          resolve();
        }
      }, 200);
      setTimeout(() => { clearInterval(check); resolve(); }, 20_000);
    });

    expect(audioChunks.length).toBeGreaterThan(0);
    console.log(`[tts] received ${audioChunks.length} audio chunks`);

    // Verify first chunk is valid base64
    const firstChunk = audioChunks[0];
    const decoded = Buffer.from(firstChunk, 'base64');
    expect(decoded.length).toBeGreaterThan(0);
    console.log(`[tts] first chunk decoded: ${decoded.length} bytes of PCM audio`);

    expect(gotDone).toBe(true);
    console.log('[tts] response.done received — synthesis complete');
    ws.close();
  });
});

// ── DashScope ASR API Tests ─────────────────────���───────────────────────────

test.describe('DashScope ASR API', () => {
  test.setTimeout(15_000);

  test('ASR WebSocket connects and accepts session.update', async () => {
    const apiKey = getDashScopeApiKey();
    const url = `${DASHSCOPE_WS_BASE}?model=qwen3-asr-flash-realtime`;

    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(url, {
        // @ts-expect-error — Bun WebSocket headers
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      socket.onopen = () => resolve(socket);
      socket.onerror = () => reject(new Error('ASR WebSocket connection failed'));
      setTimeout(() => reject(new Error('ASR connection timeout')), 10_000);
    });

    expect(ws.readyState).toBe(WebSocket.OPEN);
    console.log('[asr] WebSocket connected to DashScope');

    // Send session.update
    ws.send(JSON.stringify({
      type: 'session.update',
      event_id: 'evt_test_asr_init',
      session: {
        modalities: ['text'],
        input_audio_format: 'pcm',
        sample_rate: 16000,
        input_audio_transcription: { language: 'en' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.0,
          silence_duration_ms: 1000,
        },
      },
    }));

    // Wait for session ack
    const response = await new Promise<string>((resolve, reject) => {
      ws.onmessage = (e) => {
        resolve(typeof e.data === 'string' ? e.data : '');
      };
      setTimeout(() => reject(new Error('No ASR session response')), 10_000);
    });

    const parsed = JSON.parse(response);
    expect(['session.updated', 'session.created']).toContain(parsed.type);
    console.log('[asr] session init response:', parsed.type);
    ws.close();
  });
});

// ── DashScope LLM API Tests ─────────────────────────────────────────────────

test.describe('DashScope LLM API', () => {
  test.setTimeout(30_000);

  test('qwen-plus streams a response via OpenAI-compatible API', async () => {
    const apiKey = getDashScopeApiKey();

    const response = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          stream: true,
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Reply in one sentence.' },
            { role: 'user', content: 'What is 2+2?' },
          ],
        }),
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    console.log('[llm] streaming response started');

    // Read SSE stream and collect tokens
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            chunkCount++;
          }
        } catch { /* skip */ }
      }
    }

    expect(chunkCount).toBeGreaterThan(0);
    expect(fullText.length).toBeGreaterThan(0);
    expect(fullText.toLowerCase()).toContain('4');
    console.log(`[llm] received ${chunkCount} chunks, response: "${fullText.slice(0, 100)}"`);
  });
});
