// PROTOTYPE (issue #9, round 2), direction E: "Cutting room".
// Signature concept: the page is an edit. A film-leader countdown opens it, a timeline
// with a playhead and timecode runs along the bottom, headlines arrive as razor cuts, and
// the Housecut chapter is a depth-stacked wall of the real Cuts the pipeline delivered.

import { Big_Shoulders, Red_Hat_Text, JetBrains_Mono } from 'next/font/google';
import EClient from './EClient';

const display = Big_Shoulders({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--e-display' });
const body = Red_Hat_Text({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--e-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--e-mono' });

export const metadata = { title: 'Prototype E: cutting room' };

export default function Page() {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <style>{`body{background:#141416;color:#EDEAE3}`}</style>
      <EClient />
    </div>
  );
}
