import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/ChipSelect';
import { Dialog, ScreenIntro } from '@/components/Dialog';
import { Button } from '@/components/Button';
import { TemplateCard } from '@/components/TemplateCard';
import { TextField } from '@/components/TextField';
import { VariableDialog } from '@/components/VariableDialog';
import { createId } from '@/lib/id';
import { listTemplates, type TemplateListItem } from '@/lib/templates';
import type { TemplateFilter } from '@/lib/types';
import { applyVariables } from '@/lib/variables';
import { usePromptStore } from '@/store/PromptStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

const FILTERS: { value: TemplateFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'agents', label: 'Agents' },
  { value: 'starters', label: 'Starters' },
  { value: 'saved', label: 'Saved' },
  { value: 'favorites', label: 'Favorites' },
];

export default function TemplatesScreen() {
  const { state, dispatch } = usePromptStore();
  const { colors } = useAppTheme();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TemplateFilter>('all');
  const [pending, setPending] = useState<TemplateListItem | null>(null);
  const [pendingNames, setPendingNames] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<TemplateListItem | null>(null);

  const items = useMemo(
    () => listTemplates(state.templates, query, filter),
    [state.templates, query, filter],
  );

  function openTemplate(item: TemplateListItem) {
    if (item.variableNames.length > 0) {
      setPending(item);
      setPendingNames(item.variableNames);
      return;
    }
    applyItem(item, item.fields);
  }

  function applyItem(item: TemplateListItem, fields: TemplateListItem['fields']) {
    dispatch({ type: 'replaceFields', fields });
    setPending(null);
    if (item.source === 'starter' || item.source === 'saved') router.push('/');
  }

  if (pathname !== '/templates') return null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenIntro
          title="Templates"
          subtitle="Start from a brief, including ones for the agents you run. Your saved copies stay on this device."
        />
        <TextField label="Search templates" value={query} onChangeText={setQuery} placeholder="Search by name or task" />
        <ChipSelect label="Filter" options={FILTERS} value={filter} onChange={(value) => setFilter(value || 'all')} />
        {items.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted, fontFamily: fonts.body }]}>
            {filter === 'saved' || filter === 'favorites'
              ? 'Nothing saved matches. Fill in the builder and tap Save template.'
              : 'No templates match that search.'}
          </Text>
        ) : (
          items.map((item) => (
            <TemplateCard
              key={`${item.source}-${item.id}`}
              item={item}
              onUse={() => openTemplate(item)}
              onEdit={
                item.source === 'saved'
                  ? () => {
                      dispatch({ type: 'beginEdit', id: item.id });
                      router.push('/');
                    }
                  : undefined
              }
              onDuplicate={
                item.source === 'saved'
                  ? () =>
                      dispatch({
                        type: 'duplicateTemplate',
                        id: item.id,
                        newId: createId(),
                        now: new Date().toISOString(),
                      })
                  : undefined
              }
              onDelete={item.source === 'saved' ? () => setDeleteTarget(item) : undefined}
              onFavorite={
                item.source === 'saved'
                  ? () => dispatch({ type: 'toggleFavorite', id: item.id, now: new Date().toISOString() })
                  : undefined
              }
              onSaveCopy={
                item.source === 'starter'
                  ? () =>
                      dispatch({
                        type: 'addTemplate',
                        template: {
                          id: createId(),
                          name: `${item.name} copy`.slice(0, 80),
                          favorite: false,
                          fields: { ...item.fields },
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        },
                      })
                  : undefined
              }
            />
          ))
        )}
      </ScrollView>

      <VariableDialog
        visible={pending !== null}
        title={pending ? `Fill in ${pending.name}` : 'Fill in'}
        names={pendingNames}
        onCancel={() => setPending(null)}
        onSubmit={(values) => {
          if (!pending) return;
          applyItem(pending, applyVariables(pending.fields, values));
        }}
      />

      <Dialog visible={deleteTarget !== null} title="Delete this template?" onDismiss={() => setDeleteTarget(null)}>
        <Text style={{ color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 22 }}>
          {deleteTarget ? `Delete “${deleteTarget.name}”? This cannot be undone.` : ''}
        </Text>
        <Button
          label="Delete"
          variant="danger"
          onPress={() => {
            if (deleteTarget) dispatch({ type: 'deleteTemplate', id: deleteTarget.id });
            setDeleteTarget(null);
          }}
        />
        <Button label="Cancel" variant="quiet" onPress={() => setDeleteTarget(null)} />
      </Dialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  empty: {
    fontSize: 16,
    lineHeight: 22,
  },
});
