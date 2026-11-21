'use client';
// PROTOTYPE (issue #9, round 2), direction D. The Housecut agent harness, drawn as you scroll.
// Facts: app/lib/content.ts (S$45, 3 cuts in 24 h, Claude Code workers, HyperFrames) and
// housecut-sequence GLOSSARY.md + docs/dispatcher.md (Dispatcher, Palmier, Rounds, Approval).

const CLIPS = ['IMG_1795.mov', 'IMG_1797.mov', 'IMG_1799.mov', 'IMG_1800.mov', 'IMG_1803.mov', 'IMG_1804.mov', 'IMG_1809.mov'];
const LANES = [
  { y: 96, cut: 'Cut A', style: 'slow tour' },
  { y: 256, cut: 'Cut B', style: 'beat cut' },
  { y: 416, cut: 'Cut C', style: 'hook-first teaser' },
];

export default function HarnessD() {
  return (
    <svg className="harness" viewBox="0 0 1200 640" role="img" aria-label="Housecut pipeline: raw clips and a brief go to the dispatcher, a Claude Code worker edits three cuts, the customer reviews and either asks for a revision round or downloads.">
      <defs>
        <marker id="hd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* raw clips */}
      <g className="hd-node" data-step="0">
        <text x="40" y="70" className="hd-cap">7 raw phone clips</text>
        {CLIPS.map((c, i) => (
          <g key={c} className="hd-clip" transform={`translate(${40 + (i % 2) * 14}, ${92 + i * 58})`}>
            <rect width="150" height="46" rx="6" />
            <rect x="8" y="8" width="18" height="30" rx="3" className="hd-thumb" />
            <text x="34" y="28" className="hd-small">{c}</text>
          </g>
        ))}
      </g>

      <path className="hd-edge" data-step="1" d="M206,330 C230,330 236,330 262,330" markerEnd="url(#hd-arrow)" />
      <g className="hd-node" data-step="1">
        <rect x="266" y="282" width="168" height="96" rx="12" />
        <text x="284" y="318" className="hd-title">Brief</text>
        <text x="284" y="344" className="hd-small">written wishes + S$45</text>
        <text x="284" y="362" className="hd-small">paid through Stripe</text>
      </g>

      <path className="hd-edge" data-step="2" d="M434,330 L488,330" markerEnd="url(#hd-arrow)" />
      <g className="hd-node hd-hot" data-step="2">
        <rect x="492" y="270" width="190" height="120" rx="12" />
        <text x="510" y="306" className="hd-title">Dispatcher</text>
        <text x="510" y="332" className="hd-small">an Orca automation on</text>
        <text x="510" y="350" className="hd-small">my machine, checks for</text>
        <text x="510" y="368" className="hd-small">new rounds every minute</text>
      </g>

      {LANES.map((l, i) => (
        <g key={l.cut}>
          <path className="hd-edge" data-step="3" d={`M682,330 C712,330 704,${l.y + 40} 736,${l.y + 40}`} markerEnd="url(#hd-arrow)" />
          <g className="hd-node hd-lane" data-step="3" data-lane={i}>
            <rect x="740" y={l.y} width="250" height="80" rx="12" />
            <text x="758" y={l.y + 30} className="hd-title">{l.cut}: {l.style}</text>
            <text x="758" y={l.y + 50} className="hd-small">edited by a Palmier worker (Claude Code)</text>
            <rect x="758" y={l.y + 60} width="214" height="6" rx="3" className="hd-track" />
            <rect x="758" y={l.y + 60} width="214" height="6" rx="3" className="hd-fill" />
          </g>
          <path className="hd-edge" data-step="4" d={`M990,${l.y + 40} C1020,${l.y + 40} 1012,330 1042,330`} markerEnd="url(#hd-arrow)" />
        </g>
      ))}

      <g className="hd-node" data-step="4">
        <rect x="1046" y="270" width="140" height="120" rx="12" />
        <text x="1062" y="306" className="hd-title">Delivery</text>
        <text x="1062" y="332" className="hd-small">rendered in</text>
        <text x="1062" y="350" className="hd-small">HyperFrames, sent</text>
        <text x="1062" y="368" className="hd-small">by email + WhatsApp</text>
      </g>

      {/* review loop back to the dispatcher */}
      <path className="hd-edge hd-loop" data-step="5" d="M1116,390 C1116,600 1100,600 900,600 L640,600 C590,600 587,560 587,394" markerEnd="url(#hd-arrow)" />
      <g className="hd-node" data-step="5">
        <text x="700" y="586" className="hd-cap">Review → revision round</text>
        <text x="700" y="628" className="hd-small">feedback pinned to a moment, a frame or a drawing</text>
      </g>
      <g className="hd-node" data-step="6">
        <text x="40" y="600" className="hd-joke">There is no approve button.</text>
        <text x="40" y="626" className="hd-small">You approve a cut by downloading it and going quiet.</text>
      </g>
    </svg>
  );
}
