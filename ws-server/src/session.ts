import type { ServerWebSocket } from 'bun';
import type { ServerMessage } from './types';
import { createAsrSession, forwardAudioToAsr } from './dashscope/asr';

// Per-session data stored in Bun's WebSocket data slot
export type SessionData = {
  sessionId: string;
  session: Session | null;
};

export class Session {
  readonly sessionId: string;
  asrWs: WebSocket | null = null;
  ttsWs: WebSocket | null = null;
  isActive: boolean = true;

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
        // Store transcript for LLM call (wired in Plan 02)
        session._lastTranscript = text;
        console.log(`[session] ${session.sessionId} transcript: ${text}`);
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

  /** Last transcript received from ASR — used by LLM stage (Plan 02) */
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

    console.log(`[session] ${this.sessionId} cleaned up`);
  }
}
