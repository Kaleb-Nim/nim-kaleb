import type { ServerWebSocket } from 'bun';
import type { ServerMessage } from './types';
import { createAsrSession, forwardAudioToAsr } from './dashscope/asr';
import { streamLlmResponse } from './dashscope/llm';
import { createTtsSession, appendTextToTts, finishTtsSession } from './dashscope/tts';

// Per-session data stored in Bun's WebSocket data slot
export type SessionData = {
  sessionId: string;
  session: Session | null;
};

// Max conversation history entries (10 user + 10 assistant turns)
const MAX_HISTORY_ENTRIES = 20;

export class Session {
  readonly sessionId: string;
  asrWs: WebSocket | null = null;
  ttsWs: WebSocket | null = null;
  isActive: boolean = true;

  /** Conversation history for multi-turn context — capped at 20 entries (T-02-07) */
  conversationHistory: Array<{ role: string; content: string }> = [];

  private ws: ServerWebSocket<SessionData>;

  constructor(ws: ServerWebSocket<SessionData>) {
    this.ws = ws;
    this.sessionId = ws.data.sessionId;
  }

  /** Send a typed message to the browser client */
  send(msg: ServerMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  /** Start the ASR pipeline and signal session.ready to browser once ASR is open */
  startPipeline(): void {
    if (this.asrWs && this.asrWs.readyState === WebSocket.OPEN) {
      // Already running — re-signal ready
      this.send({ type: 'session.ready' });
      return;
    }

    const session = this;

    this.asrWs = createAsrSession({
      onTranscriptPartial: (text) => {
        session.send({ type: 'transcript.partial', text });
      },
      onTranscriptFinal: (text) => {
        session.send({ type: 'transcript.final', text });
        console.log(`[session] ${session.sessionId} transcript: ${text}`);

        // ── STT → LLM → TTS cascade ──────────────────────────────────────────

        // 1. Add user turn to conversation history
        session.conversationHistory.push({ role: 'user', content: text });
        // Cap at MAX_HISTORY_ENTRIES — shift oldest pair when exceeded (T-02-07)
        while (session.conversationHistory.length > MAX_HISTORY_ENTRIES) {
          session.conversationHistory.shift();
          session.conversationHistory.shift();
        }

        // 2. Accumulate assistant response to add to history after onDone
        let assistantResponse = '';

        // 3. Open TTS session before streaming LLM — enables streaming overlap.
        //    createTtsSession handles onopen (sends session.update) internally.
        //    We wait for the WS to be open via a Promise before starting LLM stream.
        const ttsReadyPromise = new Promise<WebSocket>((resolve, reject) => {
          const ttsWs = createTtsSession({
            onAudioDelta: (delta) => {
              session.send({ type: 'response.audio.delta', delta });
            },
            onDone: () => {
              session.send({ type: 'response.done' });
              session.ttsWs = null;
            },
            onError: (message) => {
              session.send({ type: 'error', message });
              reject(new Error(message));
            },
          });
          session.ttsWs = ttsWs;

          // Wrap original onopen to resolve the promise once TTS is ready
          const originalOnOpen = ttsWs.onopen;
          ttsWs.onopen = (event) => {
            if (originalOnOpen) (originalOnOpen as (e: Event) => void)(event);
            resolve(ttsWs);
          };
        });

        // 4. Start LLM streaming once TTS WebSocket is open
        ttsReadyPromise.then((ttsWs) => {
          // 5. Stream LLM response — chunks flow directly into TTS
          streamLlmResponse(
            text,
            session.conversationHistory.slice(0, -1), // exclude the user turn just added
            (chunk) => {
              // Streaming overlap: each chunk forwarded to TTS and browser immediately
              appendTextToTts(ttsWs, chunk);
              session.send({ type: 'response.text.delta', delta: chunk });
              assistantResponse += chunk;
            },
            () => {
              // LLM done — signal TTS to finalize synthesis
              finishTtsSession(ttsWs);
              // Add assistant turn to conversation history
              if (assistantResponse) {
                session.conversationHistory.push({ role: 'assistant', content: assistantResponse });
                // Cap again after assistant turn
                while (session.conversationHistory.length > MAX_HISTORY_ENTRIES) {
                  session.conversationHistory.shift();
                  session.conversationHistory.shift();
                }
              }
            },
            (message) => {
              session.send({ type: 'error', message });
            }
          );
        }).catch((err) => {
          console.error('[session] TTS failed to open:', err);
        });
      },
      onError: (message) => {
        session.send({ type: 'error', message });
      },
    });

    // Signal session.ready once ASR WebSocket is open
    const asrWs = this.asrWs;
    const originalOnOpen = asrWs.onopen;
    asrWs.onopen = (event) => {
      if (originalOnOpen) {
        (originalOnOpen as (event: Event) => void)(event);
      }
      session.send({ type: 'session.ready' });
      console.log(`[session] ${session.sessionId} ASR pipeline ready`);
    };
  }

  /** Forward browser audio to the ASR WebSocket */
  handleAudio(base64: string): void {
    if (!this.asrWs) {
      this.send({ type: 'error', message: 'Session not started — send session.start first' });
      return;
    }
    forwardAudioToAsr(this.asrWs, base64);
  }

  /** Last transcript received from ASR — used by LLM stage */
  _lastTranscript: string = '';

  /** Close all DashScope WebSockets and mark session inactive */
  cleanup(): void {
    this.isActive = false;

    if (this.asrWs && this.asrWs.readyState === WebSocket.OPEN) {
      this.asrWs.close();
    }
    this.asrWs = null;

    if (this.ttsWs && this.ttsWs.readyState === WebSocket.OPEN) {
      this.ttsWs.close();
    }
    this.ttsWs = null;

    this.conversationHistory = [];

    console.log(`[session] ${this.sessionId} cleaned up`);
  }
}
