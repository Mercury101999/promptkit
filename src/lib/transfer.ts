import { parseFields } from '@/lib/fields';
import type { PromptFields, SavedTemplate } from '@/lib/types';

export const EXPORT_VERSION = 1;
export const MAX_IMPORT_TEMPLATES = 100;
export const MAX_FIELD_LENGTH = 20000;
export const MAX_NAME_LENGTH = 80;

export interface TemplateExportFile {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  templates: SavedTemplate[];
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fieldTooLong(fields: PromptFields): boolean {
  return Object.values(fields).some((value) => typeof value === 'string' && value.length > MAX_FIELD_LENGTH);
}

export function serializeTemplates(templates: SavedTemplate[], exportedAt: string): string {
  const file: TemplateExportFile = {
    version: EXPORT_VERSION,
    exportedAt,
    templates,
  };
  return JSON.stringify(file, null, 2);
}

export function parseTemplateExport(raw: unknown, createId: () => string): ParseResult<SavedTemplate[]> {
  let data = raw;
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (!text) return { ok: false, error: 'Paste or choose a JSON file first.' };
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      return { ok: false, error: 'That text is not valid JSON.' };
    }
  }

  if (!isRecord(data)) return { ok: false, error: 'The file should be a JSON object.' };
  if (data.version !== EXPORT_VERSION) {
    return { ok: false, error: 'This file is from an unsupported PromptKit version.' };
  }
  if (!Array.isArray(data.templates)) {
    return { ok: false, error: 'The file is missing a templates list.' };
  }
  if (data.templates.length > MAX_IMPORT_TEMPLATES) {
    return { ok: false, error: `This file has too many templates. The limit is ${MAX_IMPORT_TEMPLATES}.` };
  }

  const seen = new Set<string>();
  const templates: SavedTemplate[] = [];

  for (let index = 0; index < data.templates.length; index += 1) {
    const parsed = parseTemplate(data.templates[index], index, createId);
    if (!parsed.ok) return parsed;
    let id = parsed.value.id;
    if (seen.has(id)) id = createId();
    seen.add(id);
    templates.push({ ...parsed.value, id });
  }

  return { ok: true, value: templates };
}

function parseTemplate(value: unknown, index: number, createId: () => string): ParseResult<SavedTemplate> {
  const label = `Template ${index + 1}`;
  if (!isRecord(value)) return { ok: false, error: `${label} is not an object.` };

  const name = typeof value.name === 'string' ? value.name.trim() : '';
  if (!name) return { ok: false, error: `${label} needs a name.` };
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `${label} ("${name.slice(0, 40)}") has a name longer than ${MAX_NAME_LENGTH} characters.` };
  }

  const formatError = strictFormatError(value.fields, name);
  if (formatError) return { ok: false, error: formatError };

  const fields = parseFields(value.fields, 'strict');
  if (!fields) return { ok: false, error: `${label} ("${name}") has invalid fields.` };
  if (!fields.task.trim()) return { ok: false, error: `${label} ("${name}") needs a task.` };
  if (fieldTooLong(fields)) {
    return { ok: false, error: `${label} ("${name}") has a field that is too long.` };
  }

  const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : createId();
  const now = new Date().toISOString();
  const createdAt = typeof value.createdAt === 'string' && value.createdAt ? value.createdAt : now;
  const updatedAt = typeof value.updatedAt === 'string' && value.updatedAt ? value.updatedAt : createdAt;

  return {
    ok: true,
    value: {
      id,
      name,
      favorite: value.favorite === true,
      fields,
      createdAt,
      updatedAt,
    },
  };
}

function strictFormatError(value: unknown, name: string): string | null {
  if (!isRecord(value)) return null;
  if (typeof value.format === 'string' && value.format && parseFields({ format: value.format }, 'strict') === null) {
    return `Template "${name}" has an unknown output format.`;
  }
  if (typeof value.length === 'string' && value.length && parseFields({ length: value.length }, 'strict') === null) {
    return `Template "${name}" has an unknown length.`;
  }
  return null;
}

export function mergeTemplates(
  existing: SavedTemplate[],
  incoming: SavedTemplate[],
  createId: () => string,
): SavedTemplate[] {
  const ids = new Set(existing.map((template) => template.id));
  const merged = [...existing];
  for (const template of incoming) {
    let id = template.id;
    if (ids.has(id)) id = createId();
    ids.add(id);
    merged.push({ ...template, id, fields: { ...template.fields } });
  }
  return merged;
}
