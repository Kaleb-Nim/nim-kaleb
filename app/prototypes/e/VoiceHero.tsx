'use client';
// PROTOTYPE (issue #9, round 4). The hero: Kaleb's portrait and his voice clone, live.
// Uses the production hook against NEXT_PUBLIC_WS_SERVER_URL (wss://ws.kalebnim.dev in
// .env.local). The portrait's light, the waveform and the captions all follow the real
// audio: the visitor's mic while they talk, the clone's voice while it answers.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRealtimeVoice } from '@/app/hooks/useRealtimeVoice';
import s from './e.module.css';

// Kaleb's studio shoot (2026-02-11), cut out locally with rembg. The files live in the
// gitignored public/prototype-media/portrait/cut/ until he OKs publishing them.
// Face boxes from OpenCV, in each cutout's own pixels: every pose is placed so the face
// lands at the same spot and size, which is what makes the pose swaps read as one person.
const FACES: Record<string, { W: number; H: number; fx: number; fy: number; fw: number }> = {
  IMG_0516: { W: 626, H: 1400, fx: 364, fy: 221, fw: 230 }, IMG_0541: { W: 714, H: 1400, fx: 399, fy: 270, fw: 292 },
  IMG_0581: { W: 814, H: 1400, fx: 589, fy: 215, fw: 227 }, IMG_0586: { W: 715, H: 1400, fx: 314, fy: 196, fw: 222 },
  IMG_0614: { W: 504, H: 1400, fx: 294, fy: 173, fw: 210 }, IMG_0616: { W: 591, H: 1400, fx: 388, fy: 252, fw: 239 },
  IMG_0647: { W: 1094, H: 1400, fx: 517, fy: 283, fw: 306 }, IMG_0648: { W: 1017, H: 1400, fx: 569, fy: 391, fw: 426 },
  IMG_0649: { W: 1256, H: 1400, fx: 705, fy: 456, fw: 446 }, IMG_0651: { W: 719, H: 1400, fx: 429, fy: 246, fw: 261 },
  IMG_0652: { W: 1126, H: 1400, fx: 693, fy: 242, fw: 262 }, IMG_0654: { W: 1039, H: 1400, fx: 734, fy: 230, fw: 249 },
};
const TALK = ['IMG_0654', 'IMG_0652', 'IMG_0586', 'IMG_0651', 'IMG_0541', 'IMG_0647', 'IMG_0581', 'IMG_0516'];
const THINK = ['IMG_0649', 'IMG_0616', 'IMG_0614', 'IMG_0648'];
const ALL = [...TALK, ...THINK];
const src = (k: string) => `/prototype-media/portrait/cut/${k}.webp`;

/** Place a cutout so its face is `size` of the frame width, centred at (50%, `y`). */
function placed(k: string, size: number, y: number): React.CSSProperties {
  const f = FACES[k];
  const scale = size / f.fw; // frame-widths per image pixel
  return { width: `${f.W * scale * 100}%`, left: `${(0.5 - f.fx * scale) * 100}%`, top: `${y * 100}%`, marginTop: `${-f.fy * scale * 100}%` };
}

export type PortraitMode = 'grade' | 'poses';

const noop = () => {};

/** The last ~160 characters of what the clone said, as plain words (the model writes markdown). */
function captionTail(t: string, upTo: number) {
  const plain = t.replace(/[*_#`>]+/g, '').replace(/\s+/g, ' ').trim().slice(0, upTo);
  if (plain.length <= 160) return plain;
  const cut = plain.slice(-160);
  return '…' + cut.slice(cut.indexOf(' ') + 1);
}

export default function VoiceHero({ tagline, mode = 'grade' }: { tagline: React.ReactNode; mode?: PortraitMode }) {
  const { status, analyserRef, playbackAnalyserRef, connect, disconnect, isConnected } = useRealtimeVoice({ transitionTo: noop });
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(status.phase);
  phaseRef.current = status.phase;
  const poseRef = useRef<HTMLDivElement>(null);
  // The hook reports 'listening' as soon as the server finishes a response, but buffered
  // audio keeps playing for a few seconds. "Speaking" here follows what you actually hear.
  const [audible, setAudible] = useState(false);
  const audibleRef = useRef(false);
  // Text arrives faster than speech, so captions are paced to time spent speaking
  // (about 15 characters a second for this voice) instead of shown all at once.
  const [spokenChars, setSpokenChars] = useState(0);
  const spokenRef = useRef({ ms: 0, last: 0, shown: 0, textLen: 0 });

  // One rAF loop reads whichever voice is active and drives the light, the glow and the trace.
  useEffect(() => {
    const el = root.current!; const c = canvas.current!; const g = c.getContext('2d')!;
    const buf = new Uint8Array(512);
    let raf = 0; let level = 0;
    // ── Pose swaps (mode 'poses'): on syllable peaks while the clone talks, slow
    // "thinking" swaps while the visitor talks, scroll-scrubbed while idle. ──
    const poses = poseRef.current ? [...poseRef.current.querySelectorAll<HTMLElement>('[data-pose]')] : [];
    let current = ALL.indexOf('IMG_0654'); let lastSwap = 0; let armed = true; let lastPhase = ''; let lastHeard = 0;
    const showPose = (k: string, now: number) => {
      const i = ALL.indexOf(k); if (i === current || i < 0) return;
      poses[current]?.classList.remove(s.poseOn); poses[i]?.classList.add(s.poseOn); current = i; lastSwap = now;
    };
    const pick = (set: string[]) => { let k = set[Math.floor(Math.random() * set.length)]; if (ALL[current] === k) k = set[(set.indexOf(k) + 1) % set.length]; return k; };
    const tick = (t: number) => {
      const pa = playbackAnalyserRef.current;
      let playRms = 0;
      if (pa) { const n = Math.min(buf.length, pa.fftSize); pa.getByteTimeDomainData(buf.subarray(0, n)); for (let i = 0; i < n; i++) { const v = (buf[i] - 128) / 128; playRms += v * v; } playRms = Math.sqrt(playRms / n); }
      const hearing = playRms > 0.01 || (phaseRef.current === 'responding');
      if (hearing !== audibleRef.current && (hearing || t - lastHeard > 400)) { audibleRef.current = hearing; setAudible(hearing); }
      if (hearing) lastHeard = t;
      const sp = spokenRef.current;
      if (hearing && sp.last) sp.ms += t - sp.last;
      sp.last = t;
      const chars = Math.floor(sp.ms * 0.015);
      if (chars - sp.shown >= 3) { sp.shown = chars; setSpokenChars(chars); }
      const phase = audibleRef.current ? 'responding' : phaseRef.current;
      const a = phase === 'responding' ? pa : phase === 'listening' ? analyserRef.current : null;
      let rms = 0;
      const w = (c.width = c.clientWidth * devicePixelRatio), h = (c.height = c.clientHeight * devicePixelRatio);
      g.clearRect(0, 0, w, h);
      g.lineWidth = 2 * devicePixelRatio;
      g.strokeStyle = phase === 'responding' ? '#F5B83D' : phase === 'listening' ? '#EDEAE3' : 'rgba(237,234,227,.35)';
      g.beginPath();
      if (a) {
        const n = Math.min(buf.length, a.fftSize);
        a.getByteTimeDomainData(buf.subarray(0, n));
        for (let i = 0; i < n; i++) { const v = (buf[i] - 128) / 128; rms += v * v; const x = (i / (n - 1)) * w; const y = h / 2 + v * h * 0.45; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
        rms = Math.sqrt(rms / n);
      } else {
        // Idle: a slow murmur so the track never looks dead.
        for (let x = 0; x <= w; x += 4) { const u = x / w; const y = h / 2 + Math.sin(u * 40 + t / 400) * Math.sin(u * Math.PI) * h * 0.06; if (x) g.lineTo(x, y); else g.moveTo(x, y); }
      }
      g.stroke();
      level += (Math.min(1, rms * 4) - level) * 0.25;
      el.style.setProperty('--level', level.toFixed(3));
      if (poses.length) {
        if (phase === 'responding') {
          if (level < 0.18) armed = true;
          if (armed && level > 0.34 && t - lastSwap > 220) { showPose(pick(TALK), t); armed = false; }
        } else if (phase === 'listening') {
          if (lastPhase !== 'listening' || t - lastSwap > 2600) showPose(pick(THINK), t);
        } else {
          // Idle: the hero's own scroll position flips through the shoot like a flip book.
          const r = el.getBoundingClientRect();
          const p = Math.min(0.999, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
          if (p > 0.02) showPose(ALL[Math.floor(p * ALL.length)], t);
          else if (t - lastSwap > 3200) showPose(pick(TALK.slice(0, 4)), t);
        }
        lastPhase = phase;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analyserRef, playbackAnalyserRef]);

  const onTalk = useCallback(() => { if (isConnected || status.phase === 'connecting') disconnect(); else connect(); }, [isConnected, status.phase, connect, disconnect]);

  const shownPhase = audible && isConnected ? 'responding' : status.phase;
  // A new response starts the caption clock again.
  useEffect(() => {
    const sp = spokenRef.current;
    if (status.responseText.length < sp.textLen || status.responseText === '') { sp.ms = 0; sp.shown = 0; setSpokenChars(0); }
    sp.textLen = status.responseText.length;
  }, [status.responseText]);
  const label =
    shownPhase === 'connecting' ? 'Connecting…'
      : shownPhase === 'listening' ? 'Listening. Ask me anything'
        : shownPhase === 'responding' ? 'Speaking'
          : 'Talk to my AI voice clone';

  return (
    <div ref={root} className={`${s.voiceHero} ${s['ph_' + shownPhase] ?? ''}`}>
      <div className={s.heroCopy}>{tagline}</div>

      <div className={s.portraitWrap}>
        <span className={s.portraitGlow} aria-hidden />
        <div className={s.monitor}>
          <span className={s.corner} /><span className={s.corner} /><span className={s.corner} /><span className={s.corner} />
          {mode === 'poses' ? (
            <div ref={poseRef} className={s.poseStack} role="img" aria-label="Kaleb Nim">
              {ALL.map((k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} data-pose={k} src={src(k)} alt="" className={`${s.pose} ${k === 'IMG_0654' ? s.poseOn : ''}`} style={placed(k, 0.2, 0.3)} />
              ))}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.portraitCut} src={src('IMG_0654')} alt="Kaleb Nim" style={placed('IMG_0654', 0.24, 0.27)} />
          )}
          <span className={s.recTally} aria-hidden>{status.phase === 'idle' || status.phase === 'error' ? 'STBY' : 'LIVE'}</span>
          <div className={s.captions} aria-live="polite">
            {shownPhase === 'responding' && status.responseText && <p className={s.capClone}>{captionTail(status.responseText, spokenChars)}</p>}
            {shownPhase === 'listening' && status.transcript && <p className={s.capYou}>You: {status.transcript}</p>}
          </div>
        </div>
        <div className={s.trackRow}>
          <span className={s.trackName}>A1</span>
          <canvas ref={canvas} className={s.liveTrack} aria-hidden />
          <span className={s.trackFile}>kaleb_voice_clone.wav</span>
        </div>
        <div className={s.heroCta}>
          <button type="button" className={`${s.rec} ${s.recBig} ${isConnected ? s.recOn : ''}`} onClick={onTalk}>
            <span className={s.recDot} aria-hidden />
            {label}
          </button>
          {isConnected && <button type="button" className={s.endCall} onClick={disconnect}>End</button>}
        </div>
        {status.error
          ? <p className={s.voiceErr}>{status.error}</p>
          : <p className={s.note}>{status.phase === 'idle' ? 'It talks back, in my voice. It doesn’t do retakes.' : ' '}</p>}
      </div>
    </div>
  );
}
