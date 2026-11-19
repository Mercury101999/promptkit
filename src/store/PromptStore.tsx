import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';

import { reducer, initialState, type Action, type AppState } from '@/lib/reducer';
import { asyncStorage, loadPersisted, savePersisted, type KeyValueStore } from '@/lib/storage';

interface PromptStoreValue {
  state: AppState;
  ready: boolean;
  dispatch: (action: Action) => void;
}

const PromptStoreContext = createContext<PromptStoreValue | null>(null);

export function PromptStoreProvider({
  children,
  storage = asyncStorage,
  initial,
  persist = initial === undefined,
}: {
  children: ReactNode;
  storage?: KeyValueStore;
  initial?: AppState;
  persist?: boolean;
}) {
  const [state, dispatch] = useReducer(reducer, initial ?? initialState);
  const [ready, setReady] = useState(initial !== undefined);

  useEffect(() => {
    if (initial) return undefined;
    let cancelled = false;
    loadPersisted(storage)
      .then((loaded) => {
        if (cancelled) return;
        if (loaded) dispatch({ type: 'hydrate', persisted: loaded });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initial, storage]);

  useEffect(() => {
    if (!ready || !persist) return undefined;
    const handle = setTimeout(() => {
      void savePersisted(storage, {
        fields: state.fields,
        templates: state.templates,
        history: state.history,
        settings: state.settings,
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [ready, persist, state, storage]);

  const value = useMemo(() => ({ state, ready, dispatch }), [state, ready]);
  return <PromptStoreContext.Provider value={value}>{children}</PromptStoreContext.Provider>;
}

export function usePromptStore(): PromptStoreValue {
  const value = useContext(PromptStoreContext);
  if (!value) throw new Error('usePromptStore must be used within PromptStoreProvider');
  return value;
}
