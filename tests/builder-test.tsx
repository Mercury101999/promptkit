import { fireEvent, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import BuilderScreen from '@/app/(tabs)/index';
import { renderWithStore } from './render';

describe('BuilderScreen', () => {
  beforeEach(() => {
    (globalThis as { __promptkitPath?: string }).__promptkitPath = '/';
    jest.mocked(Clipboard.setStringAsync).mockClear();
  });

  test('builds a preview from the task and copies it', async () => {
    await renderWithStore(<BuilderScreen />);

    expect(screen.getAllByLabelText('Prompt preview')[0]?.props.children).toMatch(/Add a task/);
    expect(screen.getByLabelText('Copy prompt').props.accessibilityState.disabled).toBe(true);

    await fireEvent.changeText(screen.getByLabelText('Task'), 'Draft a ticket reply');
    await fireEvent.changeText(screen.getByLabelText('Success criteria'), 'The user knows the next step.');

    expect(screen.getAllByText(/Draft a ticket reply/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Success criteria/).length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByLabelText('Copy prompt'));

    expect((await screen.findAllByLabelText('Copied')).length).toBeGreaterThan(0);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(expect.stringContaining('## Task\nDraft a ticket reply'));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(expect.stringContaining('## Success criteria'));
  });
});
