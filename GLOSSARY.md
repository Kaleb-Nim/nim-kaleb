# Kaleb's AI Voice Portfolio

A personal portfolio site where a visitor can read about Kaleb's work or talk out loud to an AI clone that answers in his cloned voice.

## Language

### The voice conversation

**Visitor**:
Anyone using the public site. Visitors are anonymous; there are no accounts.
_Avoid_: User, customer

**Voice clone**:
The AI that answers as Kaleb, in first person, in his cloned voice.
_Avoid_: Bot, assistant, avatar

**Voice ID**:
The DashScope identifier of Kaleb's enrolled voice (`DASHSCOPE_VOICE_ID`). It is kept server-side only.
_Avoid_: Voice key, speaker

**Voice session**:
One WebSocket connection between a visitor's browser and the ws-server. It lasts from opening the voice overlay to closing it. Its conversation history is lost when it ends.
_Avoid_: Call, chat, connection

**Turn**:
One visitor utterance and the voice clone's reply to it. A voice session keeps its last 10 turns (20 history entries).
_Avoid_: Message, exchange

**Greeting**:
The opening line the voice clone speaks as soon as a voice session is ready, before the visitor says anything.
_Avoid_: Intro, welcome message

**Barge-in**:
The visitor starting to speak while the voice clone is still replying. The reply in flight is cancelled and its queued audio is dropped.
_Avoid_: Interruption, cut-in

### The pipeline

**Voice pipeline**:
The cascade that turns a visitor's speech into a spoken reply: ASR, then LLM, then TTS, run by the ws-server.
_Avoid_: Realtime API, speech-to-speech (that names a different, single-model design)

**ASR**:
The speech-to-text stage (DashScope `qwen3-asr-flash-realtime`, with server-side VAD).
_Avoid_: STT in code and docs (fine in conversation)

**TTS**:
The text-to-speech stage that speaks the reply in the cloned voice (DashScope `qwen3-tts-vc-realtime`).
_Avoid_: Synthesis engine

**ws-server**:
The Bun WebSocket service in `ws-server/` that owns voice sessions and calls DashScope. It is the only component holding DashScope secrets.
_Avoid_: Backend, voice server, relay

**DashScope**:
Alibaba Cloud's model API, which currently provides ASR, LLM and TTS.
_Avoid_: Qwen API, Alibaba API

**System prompt**:
`prompts/system-prompt.md`: the persona and facts the LLM answers from. It is loaded once when the ws-server starts.
_Avoid_: Context file, persona file

### The site

**Section**:
A top-level area of the site (work experience, SYAI meetups, hackathons, products, hobbies, links), defined in `app/lib/sections.ts`.
_Avoid_: Page, tab, route

**Detail view**:
A single item inside a section, such as one hackathon or one product, addressed by a second hash segment (`#/hackathons/<slug>`).
_Avoid_: Subpage, modal

**Voice overlay**:
The panel that opens over the site and hosts a voice session. The floating "talk to me" mic button opens it.
_Avoid_: Voice modal, voice page

### Planning

**Wayfinder map**:
The GitHub issue labelled `wayfinder:map` that holds the destination, the decisions so far and the unresolved questions. It is the reference for what the site should become.
_Avoid_: Roadmap, spec, milestone

**Ticket**:
A sub-issue of the wayfinder map, typed by a `wayfinder:<type>` label.
_Avoid_: Phase, plan, quick task (GSD terms, retired)
