// Provider-agnostic TTS interface shared by the DashScope and Fish Audio clients.
// session.ts only depends on these shapes, so swapping providers is a config change.

export interface TtsCallbacks {
  /** base64-encoded PCM16 LE mono at 24 kHz (browser PLAYBACK_SAMPLE_RATE) */
  onAudioDelta: (base64Audio: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/**
 * Wraps the TTS WebSocket with a `finishing` flag so callers can distinguish
 * intermediate segment completions from the final one.
 */
export interface TtsHandle {
  ws: WebSocket;
  /** Set to true once finishTtsSession() is called — only then is "done" final */
  finishing: boolean;
}

/** Sample rate every provider must deliver to the browser. */
export const OUTPUT_SAMPLE_RATE = 24000;
