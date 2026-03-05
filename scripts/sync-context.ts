#!/usr/bin/env bun
/**
 * sync-context.ts
 * Reads a raw personal info file, uses Claude to extract structured fields,
 * and merges them into memory/context.json.
 *
 * Usage:
 *   bun scripts/sync-context.ts [file-path]
 *   bun run sync-context
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = join(import.meta.dir, '..');
const CONTEXT_PATH = join(ROOT, 'memory', 'context.json');
const DEFAULT_INPUT = join(ROOT, 'memory', 'raw', 'information.txt');

const EXTRACTION_PROMPT = `You are a JSON extraction engine. Given a free-form personal bio or info document, extract structured data into EXACTLY this JSON shape. Return ONLY valid JSON — no markdown, no prose, no code fences.

Rules:
- Only extract what is explicitly stated in the source text. Do NOT fabricate or infer.
- Omit any key where the information is not present (do not include empty strings or empty arrays).
- For work_history, include an entry only if at least role or company is present.
- For contact, include only keys that have actual values.

Required shape (all fields optional — omit if not in source):
{
  "personal_info": {
    "bio": "string",
    "location": "string",
    "education": "string"
  },
  "work_history": [
    {
      "role": "string",
      "company": "string",
      "period": "string",
      "highlights": ["string"]
    }
  ],
  "hobbies": ["string"],
  "contact": {
    "github": "string",
    "twitter": "string",
    "email": "string"
  }
}

Source document:
`;

type WorkEntry = {
  role?: string;
  company?: string;
  period?: string;
  highlights?: string[];
};

type ExtractedData = {
  personal_info?: {
    bio?: string;
    location?: string;
    education?: string;
  };
  work_history?: WorkEntry[];
  hobbies?: string[];
  contact?: {
    github?: string;
    twitter?: string;
    email?: string;
  };
};

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (typeof value === 'object' && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function summarizeChanges(extracted: ExtractedData): void {
  const lines: string[] = [];

  if (extracted.personal_info) {
    const keys = Object.keys(extracted.personal_info);
    lines.push(`  personal_info: ${keys.join(', ')}`);
  }
  if (extracted.work_history?.length) {
    lines.push(`  work_history: ${extracted.work_history.length} entry/entries`);
  }
  if (extracted.hobbies?.length) {
    lines.push(`  hobbies: ${extracted.hobbies.join(', ')}`);
  }
  if (extracted.contact) {
    const keys = Object.keys(extracted.contact);
    lines.push(`  contact: ${keys.join(', ')}`);
  }

  if (lines.length === 0) {
    console.log('No new data extracted — source file may be mostly empty.');
  } else {
    console.log('Fields merged into context.json:');
    lines.forEach((l) => console.log(l));
  }
}

async function main() {
  const inputPath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_INPUT;

  let rawText: string;
  try {
    rawText = readFileSync(inputPath, 'utf-8');
  } catch {
    console.error(`Error: Could not read file at ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading: ${inputPath}`);

  let context: Record<string, unknown>;
  try {
    context = JSON.parse(readFileSync(CONTEXT_PATH, 'utf-8'));
  } catch {
    console.error(`Error: Could not read context.json at ${CONTEXT_PATH}`);
    process.exit(1);
  }

  const client = new Anthropic();

  console.log('Extracting structured data with Claude...');
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: EXTRACTION_PROMPT + rawText,
      },
    ],
  });

  let rawJson = (message.content[0] as { type: string; text: string }).text.trim();
  // Strip markdown code fences if present
  rawJson = rawJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let extracted: ExtractedData;
  try {
    extracted = JSON.parse(rawJson);
  } catch {
    console.error('Error: Claude returned invalid JSON:');
    console.error(rawJson);
    process.exit(1);
  }

  // Only keep the 4 allowed sections
  const allowed: ExtractedData = {};
  if (extracted.personal_info && Object.keys(extracted.personal_info).length > 0) {
    allowed.personal_info = extracted.personal_info;
  }
  if (extracted.work_history && extracted.work_history.length > 0) {
    allowed.work_history = extracted.work_history;
  }
  if (extracted.hobbies && extracted.hobbies.length > 0) {
    allowed.hobbies = extracted.hobbies;
  }
  if (extracted.contact && Object.keys(extracted.contact).length > 0) {
    allowed.contact = extracted.contact;
  }

  const merged = deepMerge(context, allowed as Record<string, unknown>);

  writeFileSync(CONTEXT_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  console.log('context.json updated.');
  summarizeChanges(allowed);
}

main();
