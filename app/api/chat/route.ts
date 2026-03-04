import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/memory';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sentence boundary: split after . ! ? … followed by whitespace + uppercase
const SENTENCE_BOUNDARY = /(?<=[.!?…])\s+(?=[A-Z])/;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: Message[] } = await req.json();

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = buildSystemPrompt();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';

      const flush = (sentence: string, final = false) => {
        const trimmed = sentence.trim();
        if (!trimmed) return;
        controller.enqueue(
          encoder.encode(JSON.stringify({ sentence: trimmed, final }) + '\n')
        );
      };

      try {
        const anthropicStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            buffer += chunk.delta.text;

            // Split on sentence boundaries and flush complete sentences
            const parts = buffer.split(SENTENCE_BOUNDARY);
            // Keep last (possibly incomplete) part in buffer
            buffer = parts.pop() ?? '';
            for (const part of parts) {
              flush(part);
            }
          }
        }

        // Flush remaining buffer as final sentence
        if (buffer.trim()) {
          flush(buffer, true);
        } else {
          // Send empty final marker
          controller.enqueue(
            encoder.encode(JSON.stringify({ sentence: '', final: true }) + '\n')
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: msg, final: true }) + '\n')
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
