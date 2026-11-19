import { emptyFields } from '@/lib/fields';
import { applyVariables, findVariables, humanizeVariable, variableValuesComplete } from '@/lib/variables';

describe('variables', () => {
  test('finds unique placeholders in field order', () => {
    const names = findVariables({
      ...emptyFields(),
      role: '{{agent_name}}',
      task: 'Help {{agent_name}} with {{goal}}',
      context: 'Also {{goal}} and {{ask-when}}',
    });
    expect(names).toEqual(['agent_name', 'goal', 'ask-when']);
  });

  test('ignores malformed tokens', () => {
    const names = findVariables({
      ...emptyFields(),
      task: '{{ }} {{123bad}} {goal} {{ok_1}}',
    });
    expect(names).toEqual(['ok_1']);
  });

  test('replaces values without interpreting dollar signs', () => {
    const next = applyVariables(
      { ...emptyFields(), task: 'Cost is {{amount}}' },
      { amount: '$5 & change' },
    );
    expect(next.task).toBe('Cost is $5 & change');
  });

  test('leaves unknown tokens in place', () => {
    const next = applyVariables({ ...emptyFields(), task: 'Hello {{name}}' }, {});
    expect(next.task).toBe('Hello {{name}}');
  });

  test('humanizes names and checks completeness', () => {
    expect(humanizeVariable('done_so_far')).toBe('Done so far');
    expect(variableValuesComplete(['goal'], { goal: '  ' })).toBe(false);
    expect(variableValuesComplete(['goal'], { goal: 'Ship it' })).toBe(true);
  });
});
