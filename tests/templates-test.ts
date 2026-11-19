import { emptyFields } from '@/lib/fields';
import { STARTERS, starterById } from '@/lib/starters';
import { listTemplates } from '@/lib/templates';
import { findVariables } from '@/lib/variables';
import type { SavedTemplate } from '@/lib/types';

const AGENT_IDS = ['delegate-task', 'standing-instructions', 'recurring-routine', 'handoff', 'status-update', 'decision'];

describe('starters', () => {
  test('includes the everyday briefs and the agent briefs', () => {
    expect(STARTERS.filter((item) => item.kind === 'general').length).toBeGreaterThanOrEqual(10);
    expect(STARTERS.filter((item) => item.kind === 'agent').map((item) => item.id)).toEqual(AGENT_IDS);
    for (const starter of STARTERS) {
      expect(starter.fields.task.trim().length).toBeGreaterThan(0);
      expect(starter.name.length).toBeGreaterThan(0);
    }
  });

  test('agent briefs ask for a goal, a report, or a decision', () => {
    const delegate = starterById('delegate-task');
    expect(findVariables(delegate!.fields)).toEqual(expect.arrayContaining(['goal', 'done', 'report', 'ask_when']));
    expect(findVariables(starterById('standing-instructions')!.fields)).toEqual(
      expect.arrayContaining(['agent_name', 'responsibilities', 'ask_first']),
    );
    expect(findVariables(starterById('recurring-routine')!.fields)).toEqual(
      expect.arrayContaining(['routine', 'when', 'checks']),
    );
    expect(findVariables(starterById('handoff')!.fields)).toContain('next_agent');
    expect(starterById('decision')!.fields.askFirst).toMatch(/until I choose/i);
  });
});

describe('listTemplates', () => {
  const saved: SavedTemplate = {
    id: 'mine',
    name: 'Morning scan',
    favorite: true,
    fields: { ...emptyFields(), task: 'Scan job posts' },
    createdAt: '2026-11-19T00:00:00.000Z',
    updatedAt: '2026-11-19T00:00:00.000Z',
  };

  test('filters search, agents, saved, and favorites', () => {
    expect(listTemplates([saved], 'quiz', 'all').map((item) => item.name)).toEqual(['Study quiz']);
    expect(listTemplates([saved], '', 'agents').every((item) => item.kind === 'agent')).toBe(true);
    expect(listTemplates([saved], '', 'saved').map((item) => item.id)).toEqual(['mine']);
    expect(listTemplates([{ ...saved, favorite: false }], '', 'favorites')).toHaveLength(0);
    expect(listTemplates([saved], 'scan', 'favorites').map((item) => item.name)).toEqual(['Morning scan']);
  });
});
