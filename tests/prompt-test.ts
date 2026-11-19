import { emptyFields } from '@/lib/fields';
import { assemblePrompt, roleLine, sectionCount } from '@/lib/prompt';
import type { PromptFields } from '@/lib/types';

function fields(partial: Partial<PromptFields>): PromptFields {
  return { ...emptyFields(), ...partial };
}

describe('assemblePrompt', () => {
  test('includes only the sections that were filled', () => {
    const prompt = assemblePrompt(
      fields({
        role: 'a patient tutor',
        task: 'Explain DNS',
        tone: 'Friendly and plain.',
      }),
    );

    expect(prompt).toContain('You are a patient tutor.');
    expect(prompt).toContain('## Task\nExplain DNS');
    expect(prompt).toContain('## Tone\nFriendly and plain.');
    expect(prompt).not.toContain('## Context');
    expect(prompt).not.toContain('## Constraints');
    expect(prompt).not.toContain('## Success criteria');
    expect(prompt).not.toContain('## Report back');
    expect(prompt).not.toContain('## Ask before acting');
    expect(sectionCount(fields({ task: 'Explain DNS' }))).toBe(1);
  });

  test('adds agent sections when they are filled', () => {
    const prompt = assemblePrompt(
      fields({
        task: 'Watch the inbox',
        success: 'I only hear about mail I must answer.',
        report: 'Sender, subject, and whether I should reply.',
        askFirst: 'Ask before you reply to anyone.',
        constraints: 'Do not delete mail.',
      }),
    );

    expect(prompt).toContain('## Success criteria\nI only hear about mail I must answer.');
    expect(prompt).toContain('## Report back\nSender, subject, and whether I should reply.');
    expect(prompt).toContain('## Ask before acting\nAsk before you reply to anyone.');
    expect(prompt).toContain('## Constraints\nDo not delete mail.');
  });

  test('uses custom length instead of the preset', () => {
    const prompt = assemblePrompt(fields({ task: 'Summarize', length: 'brief', lengthCustom: 'Under 80 words.' }));
    expect(prompt).toContain('## Length\nUnder 80 words.');
    expect(prompt).not.toContain('150 words');
  });

  test('describes the chosen output format', () => {
    const prompt = assemblePrompt(fields({ task: 'List the steps', format: 'checklist' }));
    expect(prompt).toContain('checkbox');
  });

  test('keeps an acronym in the role', () => {
    expect(roleLine('IT help desk technician')).toBe('You are IT help desk technician.');
    expect(roleLine('You are a calm technician.')).toBe('You are a calm technician.');
    expect(roleLine('A patient tutor')).toBe('You are a patient tutor.');
  });

  test('returns an empty string when nothing was filled', () => {
    expect(assemblePrompt(emptyFields())).toBe('');
  });
});
