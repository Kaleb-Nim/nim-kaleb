// PROTOTYPE (issue #9, round 2), direction D: "Transcript".
// Signature concept: the page is a live transcript of Kaleb talking. Speaker labels and
// timestamps, words that resolve from blur like speech-to-text, and an oscilloscope
// trace that follows you down the page. The voice clone is where the transcript says "You".

import { Anybody, Figtree, Martian_Mono } from 'next/font/google';
import DClient from './DClient';

const display = Anybody({ subsets: ['latin'], axes: ['wdth'], variable: '--d-display' });
const body = Figtree({ subsets: ['latin'], variable: '--d-body' });
const mono = Martian_Mono({ subsets: ['latin'], variable: '--d-mono' });

export const metadata = { title: 'Prototype D: transcript' };

export default function Page() {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <style>{`body{background:#EDEFF2;color:#0E1013}`}</style>
      <DClient />
    </div>
  );
}
