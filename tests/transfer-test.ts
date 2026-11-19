import { emptyFields } from '@/lib/fields';
import { createId } from '@/lib/id';
import {
  mergeTemplates,
  parseTemplateExport,
  serializeTemplates,
  type TemplateExportFile,
} from '@/lib/transfer';
import type { SavedTemplate } from '@/lib/types';

function template(overrides: Partial<SavedTemplate> = {}): SavedTemplate {
  return {
    id: 't1',
    name: 'Inbox check',
    favorite: false,
    fields: { ...emptyFields(), task: 'Check the inbox' },
    createdAt: '2026-11-19T00:00:00.000Z',
    updatedAt: '2026-11-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('template transfer', () => {
  test('round-trips a backup', () => {
    const json = serializeTemplates([template({ favorite: true })], '2026-11-19T12:00:00.000Z');
    const parsed = parseTemplateExport(json, () => 'new');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value[0]?.name).toBe('Inbox check');
    expect(parsed.value[0]?.favorite).toBe(true);
    expect(parsed.value[0]?.fields.task).toBe('Check the inbox');
  });

  test('rejects a bad version, broken JSON, and a missing task', () => {
    expect(parseTemplateExport('{', createId).ok).toBe(false);
    const wrongVersion = parseTemplateExport({ version: 2, templates: [] }, createId);
    expect(wrongVersion.ok).toBe(false);
    if (!wrongVersion.ok) expect(wrongVersion.error).toMatch(/version/i);

    const missingTask = parseTemplateExport(
      { version: 1, templates: [{ name: 'Nope', fields: { task: '   ' } }] },
      createId,
    );
    expect(missingTask.ok).toBe(false);
    if (!missingTask.ok) expect(missingTask.error).toMatch(/task/i);
  });

  test('names an unknown format', () => {
    const result = parseTemplateExport(
      {
        version: 1,
        templates: [{ name: 'Odd', fields: { task: 'Do it', format: 'haiku' } }],
      },
      createId,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/format/i);
  });

  test('gives a new id when a file repeats one', () => {
    let n = 0;
    const result = parseTemplateExport(
      {
        version: 1,
        templates: [template(), template()],
      } satisfies Pick<TemplateExportFile, 'version' | 'templates'>,
      () => `dup-${(n += 1)}`,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((item) => item.id)).toEqual(['t1', 'dup-1']);
  });

  test('merge keeps existing templates and avoids id collisions', () => {
    const existing = [template({ id: 'keep' })];
    const incoming = [template({ id: 'keep', name: 'Imported' }), template({ id: 'fresh', name: 'Fresh' })];
    const merged = mergeTemplates(existing, incoming, () => 'fresh-id');
    expect(merged.map((item) => item.id)).toEqual(['keep', 'fresh-id', 'fresh']);
    expect(merged.map((item) => item.name)).toEqual(['Inbox check', 'Imported', 'Fresh']);
  });
});
