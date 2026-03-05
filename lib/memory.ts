import { readFileSync } from 'fs';
import { join } from 'path';

interface WorkEntry {
  role?: string;
  company?: string;
  period?: string;
  highlights?: string[];
}

interface ContextJSON {
  identity: Record<string, string>;
  personality: { tone: string; communication_style: string; values: string[] };
  skills: Record<string, string | string[]>;
  projects: Array<{ name: string; description: string; stack: string[] }>;
  background: Record<string, string>;
  conversation_instructions: string[];
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

  const personalSection = ctx.personal_info
    ? `\n## Personal\n${ctx.personal_info.bio ? `Bio: ${ctx.personal_info.bio}\n` : ''}${ctx.personal_info.location ? `Location: ${ctx.personal_info.location}\n` : ''}${ctx.personal_info.education ? `Education: ${ctx.personal_info.education}\n` : ''}`.trimEnd()
    : '';

  const workSection = ctx.work_history?.length
    ? `\n## Work History\n${ctx.work_history
        .map((w) => {
          const header = [w.role, w.company, w.period].filter(Boolean).join(' @ ');
          const highlights = w.highlights?.length
            ? '\n' + w.highlights.map((h) => `  - ${h}`).join('\n')
            : '';
          return `- ${header}${highlights}`;
        })
        .join('\n')}`
    : '';

  const hobbiesSection = ctx.hobbies?.length
    ? `\n## Interests\n${ctx.hobbies.join(', ')}`
    : '';

  const contactSection = ctx.contact
    ? `\n## Contact\n${Object.entries(ctx.contact)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')}`
    : '';

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
  .join('\n')}${personalSection}${workSection}${hobbiesSection}${contactSection}
`.trim();
}
