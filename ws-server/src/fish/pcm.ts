// Streaming PCM16 LE mono helpers for Fish Audio output.
// Fish chunks can split a sample across messages and may arrive at a rate other
// than the 24 kHz the browser plays, so this keeps state across chunks.

/**
 * Stateful linear-interpolation resampler for PCM16 LE mono.
 * When srcRate === dstRate it only re-aligns odd byte counts.
 */
export class Pcm16StreamResampler {
  /** Leftover odd byte from the previous chunk */
  private carryByte: number | null = null;
  /** Last input sample of the previous chunk, for interpolation across chunk edges */
  private prevSample = 0;
  /** Input samples consumed so far (absolute index of the next chunk's first sample) */
  private consumed = 0;
  /** Output samples emitted so far; output k sits at input position k * src / dst */
  private emitted = 0;

  constructor(readonly srcRate: number, readonly dstRate: number) {
    if (!Number.isInteger(srcRate) || !Number.isInteger(dstRate) || srcRate <= 0 || dstRate <= 0) {
      throw new Error('sample rates must be positive integers');
    }
  }

  /** Feed raw bytes, get back PCM16 LE bytes at dstRate. */
  push(chunk: Uint8Array): Uint8Array {
    let bytes = chunk;
    if (this.carryByte !== null) {
      const merged = new Uint8Array(chunk.length + 1);
      merged[0] = this.carryByte;
      merged.set(chunk, 1);
      bytes = merged;
      this.carryByte = null;
    }
    if (bytes.length % 2 === 1) {
      this.carryByte = bytes[bytes.length - 1];
      bytes = bytes.subarray(0, bytes.length - 1);
    }
    const n = bytes.length / 2;
    if (n === 0) return new Uint8Array(0);

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
    const input = new Int16Array(n);
    for (let i = 0; i < n; i++) input[i] = view.getInt16(i * 2, true);

    if (this.srcRate === this.dstRate) return toBytes(input);

    const base = this.consumed;
    const lastAbs = base + n - 1;
    const at = (abs: number): number => (abs < base ? this.prevSample : input[abs - base]);
    const out: number[] = [];
    // Exact integer position math (no float drift): emit while a right-hand neighbour exists.
    for (;;) {
      const num = this.emitted * this.srcRate;
      const i = Math.floor(num / this.dstRate);
      if (i >= lastAbs) break;
      const frac = (num % this.dstRate) / this.dstRate;
      const a = at(i);
      out.push(Math.round(a + (at(i + 1) - a) * frac));
      this.emitted++;
    }
    this.consumed += n;
    this.prevSample = input[n - 1];
    return toBytes(Int16Array.from(out));
  }
}

function toBytes(samples: Int16Array): Uint8Array {
  const out = new Uint8Array(samples.length * 2);
  const view = new DataView(out.buffer);
  for (let i = 0; i < samples.length; i++) view.setInt16(i * 2, samples[i], true);
  return out;
}

/** True if the text chunk ends a sentence or clause worth flushing to synthesis. */
export function endsSentence(text: string): boolean {
  return /[.!?;:]["')\]]*\s*$/.test(text) || /\n\s*$/.test(text);
}
