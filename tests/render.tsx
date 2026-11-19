import { act, render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { emptyFields } from '@/lib/fields';
import { initialState, type AppState } from '@/lib/reducer';
import { PromptStoreProvider } from '@/store/PromptStore';

export async function renderWithStore(ui: ReactElement, state?: Partial<AppState>, options?: RenderOptions) {
  const initial: AppState = {
    ...initialState,
    ...state,
    fields: state?.fields ? { ...emptyFields(), ...state.fields } : emptyFields(),
    settings: state?.settings ?? { theme: 'system' },
    templates: state?.templates ?? [],
    history: state?.history ?? [],
  };
  const view = await render(<PromptStoreProvider initial={initial}>{ui}</PromptStoreProvider>, options);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}
