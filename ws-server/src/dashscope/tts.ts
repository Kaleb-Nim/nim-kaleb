// DashScope TTS WebSocket client
// Connects to Qwen3-TTS in server_commit mode using Kaleb's cloned voice.
// The DASHSCOPE_API_KEY and DASHSCOPE_VOICE_ID are read from process.env
// and never configurable via browser messages (security: T-02-08).

const TTS_WS_URL =
  'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-tts-vc-realtime-2026-01-15';

export interface TtsCallbacks {
  onAudioDelta: (base64Audio: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/**
 * Open a DashScope TTS WebSocket session in server_commit mode.
 * Sends session.update on open with Kaleb's cloned voice_id.
 * Routes incoming messages to callbacks.
 * Returns the WebSocket so the caller can append text and finish the session.
 */
export function createTtsSession(callbacks: TtsCallbacks): WebSocket {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const voiceId = process.env.DASHSCOPE_VOICE_ID;

  if (!apiKey) {
    callbacks.onError('DASHSCOPE_API_KEY is not set');
    const dummy = new WebSocket('wss://localhost:0');
    dummy.close();
    return dummy;
  }

  const ws = new WebSocket(TTS_WS_URL, {
    // @ts-expect-error — Bun's WebSocket constructor accepts headers as second arg
    headers: {
      Authorization: 'Bearer ' + apiKey,
    },
  });

  ws.onopen = () => {
    // Initialize TTS session with server_commit mode and Kaleb's voice
    ws.send(
      JSON.stringify({
        type: 'session.update',
        event_id: 'evt_tts_init',
        session: {
          mode: 'server_commit',
          voice: voiceId,
          language_type: 'Auto',
          response_format: 'pcm',
          sample_rate: 24000,
        },
      })
    );
  };

  ws.onmessage = (event) => {
    let msg: { type: string; delta?: string; error?: { message?: string }; [key: string]: unknown };
    try {
      msg = JSON.parse(
        typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer)
      );
    } catch {
      callbacks.onError('TTS: failed to parse message');
      return;
    }

    switch (msg.type) {
      case 'response.audio.delta':
        if (msg.delta) callbacks.onAudioDelta(msg.delta);
        break;

      case 'response.done':
        callbacks.onDone();
        break;

      case 'error':
        callbacks.onError(msg.error?.message ?? 'TTS error');
        break;

      default:
        // Other events (session.created, session.updated, etc.) — ignore silently
        break;
    }
  };

  ws.onclose = () => {
    console.log('[tts] WebSocket closed');
  };

  ws.onerror = () => {
    callbacks.onError('TTS WebSocket connection error');
  };

  return ws;
}

/**
 * Append a text chunk to the TTS session for synthesis.
 * Only sends if the WebSocket is in the OPEN state.
 */
export function appendTextToTts(ttsWs: WebSocket, text: string): void {
  if (ttsWs.readyState !== WebSocket.OPEN) return;

  ttsWs.send(
    JSON.stringify({
      type: 'input_text_buffer.append',
      event_id: 'evt_tts_' + Date.now(),
      text,
    })
  );
}

/**
 * Signal the TTS session that all text has been appended.
 * The server will synthesize and send back response.done when complete.
 */
export function finishTtsSession(ttsWs: WebSocket): void {
  if (ttsWs.readyState !== WebSocket.OPEN) return;

  ttsWs.send(
    JSON.stringify({
      type: 'session.finish',
      event_id: 'evt_tts_finish',
    })
  );
}
