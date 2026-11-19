import AsyncStorage from '@react-native-async-storage/async-storage';

import { emptyFields, parseFields } from '@/lib/fields';
import { HISTORY_LIMIT } from '@/lib/reducer';
import type { HistoryEntry, PromptFields, SavedTemplate, Settings, ThemePreference } from '@/lib/types';

export const STORAGE_KEY = 'promptkit.v1';

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface PersistedState {
  fields: PromptFields;
  templates: SavedTemplate[];
  history: HistoryEntry[];
  settings: Settings;
}

export const asyncStorage: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};

const THEMES = new Set<ThemePreference>(['system', 'light', 'dark']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sanitizePersisted(value: unknown): PersistedState | null {
  if (!isRecord(value) || value.version !== 1) return null;

  const fields = parseFields(value.fields, 'lenient') ?? emptyFields();
  const templates = Array.isArray(value.templates)
    ? value.templates.flatMap((item) => {
        const template = sanitizeTemplate(item);
        return template ? [template] : [];
      })
    : [];
  const history = Array.isArray(value.history)
    ? value.history.flatMap((item) => {
        const entry = sanitizeHistory(item);
        return entry ? [entry] : [];
      }).slice(0, HISTORY_LIMIT)
    : [];

  const settingsRecord = isRecord(value.settings) ? value.settings : {};
  const theme = typeof settingsRecord.theme === 'string' && THEMES.has(settingsRecord.theme as ThemePreference)
    ? (settingsRecord.theme as ThemePreference)
    : 'system';

  return { fields, templates, history, settings: { theme } };
}

function sanitizeTemplate(value: unknown): SavedTemplate | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || !value.id.trim()) return null;
  if (typeof value.name !== 'string' || !value.name.trim()) return null;
  const fields = parseFields(value.fields, 'lenient');
  if (!fields || !fields.task.trim()) return null;
  const createdAt = typeof value.createdAt === 'string' ? value.createdAt : new Date(0).toISOString();
  const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : createdAt;
  return {
    id: value.id,
    name: value.name.trim().slice(0, 80),
    favorite: value.favorite === true,
    fields,
    createdAt,
    updatedAt,
  };
}

function sanitizeHistory(value: unknown): HistoryEntry | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.prompt !== 'string' || typeof value.createdAt !== 'string') {
    return null;
  }
  const fields = parseFields(value.fields, 'lenient');
  if (!fields) return null;
  return { id: value.id, prompt: value.prompt, fields, createdAt: value.createdAt };
}

export async function loadPersisted(store: KeyValueStore): Promise<PersistedState | null> {
  try {
    const raw = await store.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizePersisted(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function savePersisted(store: KeyValueStore, state: PersistedState): Promise<void> {
  const payload = { version: 1 as const, ...state };
  await store.setItem(STORAGE_KEY, JSON.stringify(payload));
}
