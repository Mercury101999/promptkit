import { fireEvent, screen } from '@testing-library/react-native';

import SettingsScreen from '@/app/(tabs)/settings';
import { emptyFields } from '@/lib/fields';
import { serializeTemplates } from '@/lib/transfer';
import { renderWithStore } from './render';

describe('SettingsScreen', () => {
  beforeEach(() => {
    (globalThis as { __promptkitPath?: string }).__promptkitPath = '/settings';
  });

  test('rejects invalid JSON and imports a valid backup', async () => {
    await renderWithStore(<SettingsScreen />);

    await fireEvent.changeText(screen.getByLabelText('Template JSON'), '{');
    await fireEvent.press(screen.getByLabelText('Import JSON'));
    expect(screen.getByText('That text is not valid JSON.')).toBeTruthy();

    const json = serializeTemplates(
      [
        {
          id: 'imported',
          name: 'Nightly digest',
          favorite: false,
          fields: { ...emptyFields(), task: 'Summarize what changed overnight' },
          createdAt: '2026-11-19T00:00:00.000Z',
          updatedAt: '2026-11-19T00:00:00.000Z',
        },
      ],
      '2026-11-19T00:00:00.000Z',
    );
    await fireEvent.changeText(screen.getByLabelText('Template JSON'), json);
    await fireEvent.press(screen.getByLabelText('Import JSON'));

    expect(screen.getByText('Imported 1 template.')).toBeTruthy();
    expect(screen.getByText(/1 saved template on this device/)).toBeTruthy();
  });

  test('switches the theme off the system setting', async () => {
    await renderWithStore(<SettingsScreen />);
    await fireEvent.press(screen.getByLabelText('Dark'));
    expect(screen.getByLabelText('Dark').props.accessibilityState.selected).toBe(true);
  });
});
