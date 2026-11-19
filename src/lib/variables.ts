import { STRING_FIELD_KEYS, type PromptFields, type StringFieldKey } from '@/lib/types';

const TOKEN_SOURCE = String.raw`\{\{\s*([A-Za-z][A-Za-z0-9_-]{0,40})\s*\}\}`;

export function findVariables(fields: PromptFields): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const key of STRING_FIELD_KEYS) {
    const pattern = new RegExp(TOKEN_SOURCE, 'g');
    for (const match of fields[key].matchAll(pattern)) {
      const name = match[1];
      if (!name || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function humanizeVariable(name: string): string {
  const words = name.replace(/[_-]+/g, ' ').trim();
  if (!words) return name;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function applyVariables(fields: PromptFields, values: Record<string, string>): PromptFields {
  const next: PromptFields = { ...fields };
  for (const key of STRING_FIELD_KEYS) {
    const pattern = new RegExp(TOKEN_SOURCE, 'g');
    next[key] = fields[key].replace(pattern, (full, name: string) => {
      if (!Object.prototype.hasOwnProperty.call(values, name)) return full;
      return values[name] ?? full;
    });
  }
  return next;
}

export function variableValuesComplete(names: string[], values: Record<string, string>): boolean {
  return names.every((name) => (values[name] ?? '').trim().length > 0);
}

export type { StringFieldKey };
