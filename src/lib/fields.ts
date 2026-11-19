import {
  LENGTHS,
  OUTPUT_FORMATS,
  STRING_FIELD_KEYS,
  type LengthOption,
  type OutputFormat,
  type PromptFields,
} from '@/lib/types';

export const EMPTY_FIELDS: PromptFields = {
  role: '',
  task: '',
  context: '',
  audience: '',
  tone: '',
  format: '',
  length: '',
  lengthCustom: '',
  success: '',
  report: '',
  askFirst: '',
  constraints: '',
  examples: '',
};

const FORMATS = new Set<string>(OUTPUT_FORMATS.map((item) => item.value));
const LENGTH_VALUES = new Set<string>(LENGTHS.map((item) => item.value));

export function emptyFields(): PromptFields {
  return { ...EMPTY_FIELDS };
}

export function isOutputFormat(value: string): value is OutputFormat {
  return FORMATS.has(value);
}

export function isLengthOption(value: string): value is LengthOption {
  return LENGTH_VALUES.has(value);
}

export type FieldParseMode = 'strict' | 'lenient';

/**
 * Strict mode rejects unknown format or length values (used for imports).
 * Lenient mode drops those values so a stored draft still opens.
 */
export function parseFields(value: unknown, mode: FieldParseMode): PromptFields | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const fields = emptyFields();

  for (const key of STRING_FIELD_KEYS) {
    const raw = record[key];
    if (raw === undefined) continue;
    if (typeof raw !== 'string') return null;
    fields[key] = raw;
  }

  const format = record.format;
  if (format !== undefined && format !== '') {
    if (typeof format !== 'string') return null;
    if (!isOutputFormat(format)) {
      if (mode === 'strict') return null;
    } else {
      fields.format = format;
    }
  }

  const length = record.length;
  if (length !== undefined && length !== '') {
    if (typeof length !== 'string') return null;
    if (!isLengthOption(length)) {
      if (mode === 'strict') return null;
    } else {
      fields.length = length;
    }
  }

  return fields;
}

export function hasTask(fields: PromptFields): boolean {
  return fields.task.trim().length > 0;
}

export function hasAnyContent(fields: PromptFields): boolean {
  if (fields.format || fields.length) return true;
  return STRING_FIELD_KEYS.some((key) => fields[key].trim().length > 0);
}

export function taskSummary(task: string): string {
  const line = task.trim().split('\n')[0] ?? '';
  if (!line) return 'Untitled prompt';
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}
