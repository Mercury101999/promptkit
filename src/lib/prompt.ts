import type { LengthOption, OutputFormat, PromptFields } from '@/lib/types';

const FORMAT_COPY: Record<OutputFormat, string> = {
  paragraph: 'Write in clear prose paragraphs.',
  bullets: 'Use a concise bulleted list.',
  numbered: 'Use a numbered list.',
  steps: 'Write an ordered sequence of steps a person can follow.',
  checklist: 'Write a checklist, with one action per line and a checkbox on every item.',
  table: 'Use a markdown table with a header row.',
  email: 'Write a ready-to-send email, including a subject line.',
  code: 'Respond with code. Add a short note only where the code is not self-explanatory.',
  json: 'Respond with valid JSON only. Do not add commentary around it.',
  markdown: 'Use GitHub-flavored markdown with headings.',
};

const LENGTH_COPY: Record<LengthOption, string> = {
  brief: 'Keep it short. About 150 words or fewer, unless the format cannot be that short.',
  medium: 'Use a moderate length: enough to be useful, not an essay.',
  detailed: 'Be thorough. Cover edge cases, and include an example where it helps.',
};

function clean(value: string): string {
  return value.trim();
}

/** "You are …" without doubling a prefix, and without lowercasing an acronym. */
export function roleLine(role: string): string | null {
  const trimmed = clean(role).replace(/[.]+$/g, '');
  if (!trimmed) return null;
  const body = trimmed.replace(/^(you are|you're|act as)\s+/i, '').trim();
  if (!body) return null;
  const softened = /^[A-Z]([^A-Z]|$)/.test(body) ? `${body.charAt(0).toLowerCase()}${body.slice(1)}` : body;
  return `You are ${softened}.`;
}

function audienceBody(audience: string): string {
  const trimmed = clean(audience);
  if (trimmed.includes('\n') || /^(write|for|the reader)\b/i.test(trimmed)) return trimmed;
  return `Write this for ${trimmed.replace(/[.]+$/g, '')}.`;
}

export function promptParts(fields: PromptFields): string[] {
  const parts: string[] = [];
  const role = roleLine(fields.role);
  if (role) parts.push(role);

  const task = clean(fields.task);
  if (task) parts.push(`## Task\n${task}`);

  const context = clean(fields.context);
  if (context) parts.push(`## Context\n${context}`);

  const audience = clean(fields.audience);
  if (audience) parts.push(`## Audience\n${audienceBody(audience)}`);

  const tone = clean(fields.tone);
  if (tone) parts.push(`## Tone\n${tone}`);

  if (fields.format) parts.push(`## Output\n${FORMAT_COPY[fields.format]}`);

  const customLength = clean(fields.lengthCustom);
  if (customLength) parts.push(`## Length\n${customLength}`);
  else if (fields.length) parts.push(`## Length\n${LENGTH_COPY[fields.length]}`);

  const success = clean(fields.success);
  if (success) parts.push(`## Success criteria\n${success}`);

  const report = clean(fields.report);
  if (report) parts.push(`## Report back\n${report}`);

  const askFirst = clean(fields.askFirst);
  if (askFirst) parts.push(`## Ask before acting\n${askFirst}`);

  const constraints = clean(fields.constraints);
  if (constraints) parts.push(`## Constraints\n${constraints}`);

  const examples = clean(fields.examples);
  if (examples) parts.push(`## Examples\n${examples}`);

  return parts;
}

export function assemblePrompt(fields: PromptFields): string {
  return promptParts(fields).join('\n\n');
}

export function sectionCount(fields: PromptFields): number {
  return promptParts(fields).length;
}
