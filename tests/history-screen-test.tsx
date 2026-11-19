import { fireEvent, screen } from '@testing-library/react-native';

import HistoryScreen from '@/app/(tabs)/history';
import { emptyFields } from '@/lib/fields';
import { renderWithStore } from './render';
import type { HistoryEntry } from '@/lib/types';

const entry: HistoryEntry = {
  id: 'h1',
  prompt: '## Task\nExplain DNS to a beginner',
  fields: { ...emptyFields(), task: 'Explain DNS to a beginner' },
  createdAt: new Date().toISOString(),
};

describe('HistoryScreen', () => {
  beforeEach(() => {
    (globalThis as { __promptkitPath?: string }).__promptkitPath = '/history';
  });

  test('shows a copied prompt and clears history after confirmation', async () => {
    await renderWithStore(<HistoryScreen />, { history: [entry] });
    expect(screen.getAllByText(/Explain DNS to a beginner/).length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByLabelText('Clear history'));
    expect(screen.getByText(/Saved templates stay/)).toBeTruthy();
    const clearButtons = screen.getAllByLabelText('Clear history');
    await fireEvent.press(clearButtons[clearButtons.length - 1]!);

    expect(screen.getByText(/Nothing copied yet/)).toBeTruthy();
  });
});
