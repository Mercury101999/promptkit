import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';

import TemplatesScreen from '@/app/(tabs)/templates';
import { emptyFields } from '@/lib/fields';
import { initialState } from '@/lib/reducer';
import { PromptStoreProvider, usePromptStore } from '@/store/PromptStore';
import { renderWithStore } from './render';
import type { SavedTemplate } from '@/lib/types';

function TaskProbe() {
  const { state } = usePromptStore();
  return <Text testID="built-task">{state.fields.task}</Text>;
}

const saved: SavedTemplate = {
  id: 'mine',
  name: 'Morning scan',
  favorite: false,
  fields: { ...emptyFields(), task: 'Scan the overnight alerts' },
  createdAt: '2026-11-19T00:00:00.000Z',
  updatedAt: '2026-11-19T00:00:00.000Z',
};

describe('TemplatesScreen', () => {
  beforeEach(() => {
    (globalThis as { __promptkitPath?: string }).__promptkitPath = '/templates';
    jest.mocked(router.push).mockClear();
  });

  test('searches starters and asks for blanks before building', async () => {
    await render(
      <PromptStoreProvider initial={initialState}>
        <TemplatesScreen />
        <TaskProbe />
      </PromptStoreProvider>,
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Delegate a task')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Search templates'), 'quiz');
    expect(screen.getByText('Study quiz')).toBeTruthy();
    expect(screen.queryByText('Delegate a task')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Search templates'), '');
    await fireEvent.press(screen.getByLabelText('Use Delegate a task'));
    expect(screen.getByText('Fill in Delegate a task')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Goal'), 'Draft the status note');
    await fireEvent.changeText(screen.getByLabelText('Context'), 'The ticket is waiting on a password reset.');
    await fireEvent.changeText(screen.getByLabelText('Done'), 'The note is ready to paste.');
    await fireEvent.changeText(screen.getByLabelText('Report'), 'The note, and anything you had to leave out.');
    await fireEvent.changeText(screen.getByLabelText('Ask when'), 'the reset would lock the account');

    await fireEvent.press(screen.getByLabelText('Build prompt'));

    expect(screen.getByTestId('built-task').props.children).toBe('Draft the status note');
    expect(router.push).toHaveBeenCalledWith('/');
  });

  test('asks before deleting a saved template', async () => {
    await renderWithStore(<TemplatesScreen />, { templates: [saved] });
    await fireEvent.press(screen.getByLabelText('Favorites'));
    expect(screen.queryByText('Morning scan')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Saved'));
    await fireEvent.press(screen.getByLabelText('Delete Morning scan'));
    expect(screen.getByText(/Delete “Morning scan”/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Delete'));
    expect(screen.queryByText('Morning scan')).toBeNull();
  });
});
