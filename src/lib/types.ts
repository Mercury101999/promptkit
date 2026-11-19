export const OUTPUT_FORMATS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'bullets', label: 'Bullets' },
  { value: 'numbered', label: 'Numbered' },
  { value: 'steps', label: 'Steps' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'table', label: 'Table' },
  { value: 'email', label: 'Email' },
  { value: 'code', label: 'Code' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
] as const;

export const LENGTHS = [
  { value: 'brief', label: 'Brief' },
  { value: 'medium', label: 'Medium' },
  { value: 'detailed', label: 'Detailed' },
] as const;

export const TONE_PRESETS = [
  'Direct and concrete.',
  'Friendly and plain.',
  'Professional and warm.',
  'Calm and practical.',
  'Technical, and define the jargon.',
] as const;

export type OutputFormat = (typeof OUTPUT_FORMATS)[number]['value'];
export type LengthOption = (typeof LENGTHS)[number]['value'];
export type ThemePreference = 'system' | 'light' | 'dark';
export type TemplateKind = 'general' | 'agent';
export type TemplateFilter = 'all' | 'starters' | 'agents' | 'saved' | 'favorites';

export interface PromptFields {
  role: string;
  task: string;
  context: string;
  audience: string;
  tone: string;
  format: OutputFormat | '';
  length: LengthOption | '';
  lengthCustom: string;
  success: string;
  report: string;
  askFirst: string;
  constraints: string;
  examples: string;
}

export const STRING_FIELD_KEYS = [
  'role',
  'task',
  'context',
  'audience',
  'tone',
  'lengthCustom',
  'success',
  'report',
  'askFirst',
  'constraints',
  'examples',
] as const satisfies readonly (keyof PromptFields)[];

export type StringFieldKey = (typeof STRING_FIELD_KEYS)[number];

export interface SavedTemplate {
  id: string;
  name: string;
  favorite: boolean;
  fields: PromptFields;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  fields: PromptFields;
  createdAt: string;
}

export interface Settings {
  theme: ThemePreference;
}

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  kind: TemplateKind;
  fields: PromptFields;
}
