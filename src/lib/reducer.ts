import { emptyFields } from '@/lib/fields';
import type { HistoryEntry, PromptFields, SavedTemplate, Settings } from '@/lib/types';

export const HISTORY_LIMIT = 50;

export interface AppState {
  fields: PromptFields;
  editingId: string | null;
  editingName: string;
  templates: SavedTemplate[];
  history: HistoryEntry[];
  settings: Settings;
}

export const initialState: AppState = {
  fields: emptyFields(),
  editingId: null,
  editingName: '',
  templates: [],
  history: [],
  settings: { theme: 'system' },
};

export type Action =
  | { type: 'hydrate'; persisted: Pick<AppState, 'fields' | 'templates' | 'history' | 'settings'> }
  | { type: 'patchFields'; patch: Partial<PromptFields> }
  | { type: 'replaceFields'; fields: PromptFields }
  | { type: 'clearFields' }
  | { type: 'beginEdit'; id: string }
  | { type: 'setEditingName'; name: string }
  | { type: 'cancelEdit' }
  | { type: 'saveNewTemplate'; name: string; id: string; now: string }
  | { type: 'saveEdit'; now: string }
  | { type: 'duplicateTemplate'; id: string; newId: string; now: string }
  | { type: 'addTemplate'; template: SavedTemplate }
  | { type: 'toggleFavorite'; id: string; now: string }
  | { type: 'deleteTemplate'; id: string }
  | { type: 'importTemplates'; templates: SavedTemplate[] }
  | { type: 'recordCopy'; prompt: string; id: string; now: string }
  | { type: 'clearHistory' }
  | { type: 'restoreHistory'; id: string }
  | { type: 'setTheme'; theme: Settings['theme'] };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        fields: { ...action.persisted.fields },
        templates: action.persisted.templates.map((template) => ({ ...template, fields: { ...template.fields } })),
        history: action.persisted.history.map((entry) => ({ ...entry, fields: { ...entry.fields } })),
        settings: { ...action.persisted.settings },
        editingId: null,
        editingName: '',
      };
    case 'patchFields':
      return { ...state, fields: { ...state.fields, ...action.patch } };
    case 'replaceFields':
      return { ...state, fields: { ...action.fields }, editingId: null, editingName: '' };
    case 'clearFields':
      return { ...state, fields: emptyFields(), editingId: null, editingName: '' };
    case 'beginEdit': {
      const template = state.templates.find((item) => item.id === action.id);
      if (!template) return state;
      return {
        ...state,
        editingId: template.id,
        editingName: template.name,
        fields: { ...template.fields },
      };
    }
    case 'setEditingName':
      return { ...state, editingName: action.name };
    case 'cancelEdit':
      return { ...state, editingId: null, editingName: '' };
    case 'saveNewTemplate': {
      const name = action.name.trim();
      if (!name || !state.fields.task.trim()) return state;
      const template: SavedTemplate = {
        id: action.id,
        name: name.slice(0, 80),
        favorite: false,
        fields: { ...state.fields },
        createdAt: action.now,
        updatedAt: action.now,
      };
      return { ...state, templates: [template, ...state.templates] };
    }
    case 'saveEdit': {
      if (!state.editingId) return state;
      const name = state.editingName.trim();
      if (!name || !state.fields.task.trim()) return state;
      const editingId = state.editingId;
      return {
        ...state,
        editingId: null,
        editingName: '',
        templates: state.templates.map((template) =>
          template.id === editingId
            ? {
                ...template,
                name: name.slice(0, 80),
                fields: { ...state.fields },
                updatedAt: action.now,
              }
            : template,
        ),
      };
    }
    case 'duplicateTemplate': {
      const source = state.templates.find((template) => template.id === action.id);
      if (!source) return state;
      const copy: SavedTemplate = {
        ...source,
        id: action.newId,
        name: `${source.name} copy`.slice(0, 80),
        favorite: false,
        fields: { ...source.fields },
        createdAt: action.now,
        updatedAt: action.now,
      };
      return { ...state, templates: [copy, ...state.templates] };
    }
    case 'addTemplate':
      return { ...state, templates: [action.template, ...state.templates] };
    case 'toggleFavorite':
      return {
        ...state,
        templates: state.templates.map((template) =>
          template.id === action.id
            ? { ...template, favorite: !template.favorite, updatedAt: action.now }
            : template,
        ),
      };
    case 'deleteTemplate':
      return {
        ...state,
        editingId: state.editingId === action.id ? null : state.editingId,
        editingName: state.editingId === action.id ? '' : state.editingName,
        templates: state.templates.filter((template) => template.id !== action.id),
      };
    case 'importTemplates':
      return {
        ...state,
        templates: [...state.templates, ...action.templates.map((template) => ({ ...template, fields: { ...template.fields } }))],
      };
    case 'recordCopy': {
      if (!action.prompt.trim()) return state;
      const entry: HistoryEntry = {
        id: action.id,
        prompt: action.prompt,
        fields: { ...state.fields },
        createdAt: action.now,
      };
      return { ...state, history: [entry, ...state.history].slice(0, HISTORY_LIMIT) };
    }
    case 'clearHistory':
      return { ...state, history: [] };
    case 'restoreHistory': {
      const entry = state.history.find((item) => item.id === action.id);
      if (!entry) return state;
      return { ...state, fields: { ...entry.fields }, editingId: null, editingName: '' };
    }
    case 'setTheme':
      return { ...state, settings: { ...state.settings, theme: action.theme } };
    default:
      return state;
  }
}
