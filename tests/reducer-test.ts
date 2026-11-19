import { emptyFields } from '@/lib/fields';
import { HISTORY_LIMIT, initialState, reducer, type AppState } from '@/lib/reducer';
import type { SavedTemplate } from '@/lib/types';

function state(partial: Partial<AppState> = {}): AppState {
  return {
    ...initialState,
    ...partial,
    fields: partial.fields ?? { ...emptyFields(), task: 'Write the brief' },
  };
}

function saved(overrides: Partial<SavedTemplate> = {}): SavedTemplate {
  return {
    id: 'a',
    name: 'Brief',
    favorite: false,
    fields: { ...emptyFields(), task: 'Write the brief' },
    createdAt: '2026-11-19T00:00:00.000Z',
    updatedAt: '2026-11-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('reducer', () => {
  test('saves, duplicates, favorites, and deletes a template', () => {
    let next = reducer(state(), {
      type: 'saveNewTemplate',
      name: '  Weekly brief  ',
      id: 'new',
      now: '2026-11-19T01:00:00.000Z',
    });
    expect(next.templates[0]?.name).toBe('Weekly brief');

    next = reducer(next, { type: 'toggleFavorite', id: 'new', now: '2026-11-19T02:00:00.000Z' });
    expect(next.templates[0]?.favorite).toBe(true);

    next = reducer(next, { type: 'duplicateTemplate', id: 'new', newId: 'copy', now: '2026-11-19T03:00:00.000Z' });
    expect(next.templates.map((item) => item.name)).toEqual(['Weekly brief copy', 'Weekly brief']);
    expect(next.templates[0]?.favorite).toBe(false);

    next = reducer(next, { type: 'deleteTemplate', id: 'copy' });
    expect(next.templates).toHaveLength(1);
  });

  test('refuses to save without a task or a name', () => {
    const blank = reducer(state({ fields: emptyFields() }), {
      type: 'saveNewTemplate',
      name: 'Nope',
      id: 'x',
      now: '2026-11-19T01:00:00.000Z',
    });
    expect(blank.templates).toHaveLength(0);
    const unnamed = reducer(state(), {
      type: 'saveNewTemplate',
      name: '   ',
      id: 'x',
      now: '2026-11-19T01:00:00.000Z',
    });
    expect(unnamed.templates).toHaveLength(0);
  });

  test('edits a template and can cancel', () => {
    const start = state({ templates: [saved()] });
    const editing = reducer(start, { type: 'beginEdit', id: 'a' });
    expect(editing.editingId).toBe('a');
    const renamed = reducer(
      { ...editing, editingName: 'Renamed', fields: { ...editing.fields, task: 'New task' } },
      { type: 'saveEdit', now: '2026-11-19T04:00:00.000Z' },
    );
    expect(renamed.editingId).toBeNull();
    expect(renamed.templates[0]?.name).toBe('Renamed');
    expect(renamed.templates[0]?.fields.task).toBe('New task');

    const again = reducer(renamed, { type: 'beginEdit', id: 'a' });
    const cancelled = reducer(again, { type: 'cancelEdit' });
    expect(cancelled.editingId).toBeNull();
    expect(cancelled.templates[0]?.name).toBe('Renamed');
  });

  test('caps copied prompts at 50, newest first', () => {
    let next = state({ history: [] });
    for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
      next = reducer(next, {
        type: 'recordCopy',
        prompt: `Prompt ${index}`,
        id: `h${index}`,
        now: `2026-11-19T00:${String(index).padStart(2, '0')}:00.000Z`,
      });
    }
    expect(next.history).toHaveLength(HISTORY_LIMIT);
    expect(next.history[0]?.prompt).toBe(`Prompt ${HISTORY_LIMIT + 4}`);
    expect(next.history.at(-1)?.prompt).toBe('Prompt 5');
  });

  test('restore puts the copied fields back into the form', () => {
    const start = reducer(state(), {
      type: 'recordCopy',
      prompt: 'You are a tutor.\n\n## Task\nExplain DNS',
      id: 'h1',
      now: '2026-11-19T01:00:00.000Z',
    });
    const cleared = reducer(start, { type: 'clearFields' });
    const restored = reducer(cleared, { type: 'restoreHistory', id: 'h1' });
    expect(restored.fields.task).toBe('Write the brief');
  });

  test('clear history leaves templates alone', () => {
    const start = state({ templates: [saved()], history: [] });
    const withHistory = reducer(start, { type: 'recordCopy', prompt: 'Hi', id: 'h', now: '2026-11-19T01:00:00.000Z' });
    const cleared = reducer(withHistory, { type: 'clearHistory' });
    expect(cleared.history).toHaveLength(0);
    expect(cleared.templates).toHaveLength(1);
  });
});
