import { emptyFields } from '@/lib/fields';
import { loadPersisted, sanitizePersisted, savePersisted, type KeyValueStore } from '@/lib/storage';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: async (key) => data[key] ?? null,
    setItem: async (key, value) => {
      data[key] = value;
    },
  };
}

describe('storage', () => {
  test('drops a corrupt payload instead of throwing', async () => {
    const store = memoryStore({ 'promptkit.v1': '{not json' });
    await expect(loadPersisted(store)).resolves.toBeNull();
    expect(sanitizePersisted({ version: 2 })).toBeNull();
  });

  test('keeps a draft when an old field value is unknown', () => {
    const loaded = sanitizePersisted({
      version: 1,
      fields: { task: 'Keep me', format: 'haiku', success: 'Shipped' },
      templates: [{ id: 'ok', name: 'Saved', fields: { task: 'Still here' }, favorite: true }],
      history: [{ id: 'h', prompt: 'Keep me', fields: { task: 'Keep me' }, createdAt: '2026-11-19T00:00:00.000Z' }],
      settings: { theme: 'dark' },
    });
    expect(loaded?.fields.task).toBe('Keep me');
    expect(loaded?.fields.format).toBe('');
    expect(loaded?.fields.success).toBe('Shipped');
    expect(loaded?.templates).toHaveLength(1);
    expect(loaded?.settings.theme).toBe('dark');
    expect(loaded?.history).toHaveLength(1);
  });

  test('saves and loads the same draft', async () => {
    const store = memoryStore();
    await savePersisted(store, {
      fields: { ...emptyFields(), task: 'Draft a brief' },
      templates: [],
      history: [],
      settings: { theme: 'light' },
    });
    const loaded = await loadPersisted(store);
    expect(loaded?.fields.task).toBe('Draft a brief');
    expect(loaded?.settings.theme).toBe('light');
  });
});
