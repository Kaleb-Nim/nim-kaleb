import { readFileSync } from 'fs';
import { join } from 'path';

interface ContextJSON {
  identity: Record<string, string>;
  personality: { tone: string; communication_style: string; values: string[] };
  skills: Record<string, string | string[]>;
  projects: Array<{ name: string; description: string; stack: string[] }>;
  background: Record<string, string>;
  conversation_instructions: string[];
}

let _context: ContextJSON | null = null;

export function loadContext(): ContextJSON {
  if (_context) return _context;
  const filePath = join(process.cwd(), 'memory', 'context.json');
  _context = JSON.parse(readFileSync(filePath, 'utf-8')) as ContextJSON;
  return _context;
}

export function buildSystemPrompt(): string {
  const ctx = loadContext();

  const instructions = ctx.conversation_instructions.join('\n');

  const projectList = ctx.projects
    .map((p) => `  - ${p.name}: ${p.description} (Stack: ${p.stack.join(', ')})`)
    .join('\n');

  const skillsList = [
    ...(ctx.skills.primary as string[]),
    ...(ctx.skills.languages as string[]),
    ...(ctx.skills.frameworks as string[]),
  ].join(', ');

  return `${instructions}

## Identity
Name: ${ctx.identity.name}
Operating Model: ${ctx.identity.operating_model}
Tagline: ${ctx.identity.tagline}
Tone: ${ctx.personality.tone}
Values: ${ctx.personality.values.join(', ')}

## Skills
${skillsList}

## Projects
${projectList}

## Background
${Object.entries(ctx.background)
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}
`.trim();
}
