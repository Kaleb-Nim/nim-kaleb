# nim-kaleb

> **Welcome to my AI voice portfolio.** Instead of reading a static résumé, visitors talk to an AI clone that answers in my own  cloned voice — about his experience, projects, and goals.

**Live:** https://nim-kaleb.vercel.app

![Kebab Neural Interface boot screen](./public/readme/hero.png)

---

## What it is

A sci-fi terminal UI ("Kebab Neural Interface") renders over an animated starfield. The visitor types `1` to activate the voice interface, which opens a real-time voice session with an AI clone of Kaleb.

The voice pipeline runs end-to-end on **Alibaba DashScope**:

- **ASR** — `qwen3-asr-flash-realtime` (streaming speech-to-text)
- **LLM** — `qwen-plus` (conversational reasoning with Kaleb's biography as system prompt)
- **TTS** — `qwen3-tts-vc-realtime` (streaming text-to-speech with Kaleb's **voice clone**)

The conversation feels like talking to Kaleb, not a chatbot: his cadence, his filler words, his voice.

![Connecting screen](./public/readme/connecting.png)

---

## Architecture

```mermaid
flowchart LR
    subgraph Client["Browser — Vercel"]
        UI["Next.js 16 Terminal UI<br/>React 19 · Tailwind 4"]
        Mic["getUserMedia<br/>16 kHz PCM"]
        Spk["Web Audio API<br/>24 kHz playback"]
    end

    subgraph Edge["Alibaba ECS · Singapore"]
        WS["ws-server (Bun)<br/>wss://ws.kalebnim.dev"]
    end

    subgraph DashScope["Alibaba DashScope"]
        ASR["Qwen3-ASR<br/>Realtime WS"]
        LLM["qwen-plus<br/>Compatible-mode REST"]
        TTS["Qwen3-TTS-VC<br/>Voice-Cloned WS"]
    end

    Mic -- "WebSocket<br/>audio.append" --> WS
    WS -- "transcript<br/>response deltas" --> Spk
    WS <--> ASR
    WS <--> LLM
    WS <--> TTS
```

---

## Voice call flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant W as ws-server (ECS)
    participant A as DashScope ASR
    participant L as qwen-plus LLM
    participant T as DashScope TTS-VC

    U->>B: Speak into mic
    B->>W: audio.append (PCM16 base64)
    W->>A: stream audio
    A-->>W: transcript.partial / final
    W->>L: chat.completions(history + final transcript)
    L-->>W: response text (streamed)
    W->>T: TTS stream(text chunks, voice_id=Kaleb)
    T-->>W: response.audio.delta (24 kHz PCM)
    W-->>B: relay audio + text deltas
    B-->>U: Gapless audio playback via Web Audio
```

---

## Deployment topology

```mermaid
flowchart TB
    DNS["kalebnim.dev DNS<br/>A ws → 43.106.3.158"]

    subgraph Vercel["Vercel"]
        FE["Next.js app<br/>nim-kaleb.vercel.app"]
    end

    subgraph ECS["Alibaba Cloud ECS · ap-southeast-1c"]
        NGX["Nginx + Let's Encrypt<br/>wss://ws.kalebnim.dev"]
        BUN["Bun ws-server<br/>systemd: ws-server.service"]
        NGX --> BUN
    end

    subgraph DS["Alibaba DashScope (managed)"]
        ASR2["Qwen3-ASR"]
        LLM2["qwen-plus"]
        TTS2["Qwen3-TTS-VC"]
    end

    User((User)) --> FE
    FE -- WSS --> NGX
    DNS --- NGX
    BUN --> ASR2
    BUN --> LLM2
    BUN --> TTS2
```

---

## Services

| Directory      | Runtime        | Role                                                                                     |
| -------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `app/`         | Next.js 16     | Terminal UI, starfield, state machine, voice WebSocket client                            |
| `ws-server/`   | Bun / TS       | Session orchestrator on ECS — fans out to DashScope ASR / LLM / TTS and relays to client |
| `tts-server/`  | Python FastAPI | Local Qwen3-TTS fallback server (dev-only, not in the prod pipeline)                     |

---

## Tech stack

- **Frontend:** Next.js 16 (App Router) · React 19.2 · TypeScript 5 · Tailwind CSS 4 · Anonymous Pro (Google Fonts)
- **Edge server:** Bun · WebSocket streaming · Nginx + Let's Encrypt
- **AI pipeline:** Alibaba DashScope — Qwen3-ASR · qwen-plus · Qwen3-TTS-VC
- **Infra:** Vercel (frontend) · Alibaba Cloud ECS Singapore (ws-server)
- **Testing:** Playwright 1.58

---

## Environment variables

Required for production.

| Variable                     | Where          | Purpose                                                              |
| ---------------------------- | -------------- | -------------------------------------------------------------------- |
| `DASHSCOPE_API_KEY`          | ws-server      | Auth for all three DashScope services (ASR, LLM, TTS)                |
| `DASHSCOPE_VOICE_ID`         | ws-server      | Voice clone ID used by TTS (Kaleb's cloned voice profile)            |
| `NEXT_PUBLIC_WS_SERVER_URL`  | Vercel         | Browser WebSocket endpoint, e.g. `wss://ws.kalebnim.dev`             |
| `OPENAI_API_KEY`             | Vercel         | Legacy Realtime session route (`app/api/realtime/session`)           |
| `PORT`                       | ws-server      | Listen port (default `8080`; Nginx terminates TLS in front)          |
| `LOG_DIR`                    | ws-server      | Optional conversation log directory                                  |

---

## License

Personal portfolio — all rights reserved. Not a template. © Kaleb Nim.
