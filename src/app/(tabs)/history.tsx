import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Dialog, ScreenIntro } from '@/components/Dialog';
import { copyText } from '@/lib/clipboard';
import { taskSummary } from '@/lib/fields';
import { formatWhen } from '@/lib/time';
import { usePromptStore } from '@/store/PromptStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export default function HistoryScreen() {
  const { state, dispatch } = usePromptStore();
  const { colors } = useAppTheme();
  const pathname = usePathname();
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState('');

  if (pathname !== '/history') return null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ScreenIntro title="History" subtitle="The last 50 prompts you copied, newest first. Stored only on this device." />
          <Button label="Clear history" variant="danger" disabled={state.history.length === 0} onPress={() => setConfirm(true)} />
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.live}>
          {notice}
        </Text>
        {state.history.length === 0 ? (
          <Text style={[styles.empty, { color: colors.muted, fontFamily: fonts.body }]}>
            Nothing copied yet. Build a prompt and tap Copy.
          </Text>
        ) : (
          state.history.map((entry) => (
            <View key={entry.id} style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
              <Text style={[styles.task, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>{taskSummary(entry.fields.task)}</Text>
              <Text style={[styles.when, { color: colors.muted, fontFamily: fonts.body }]}>{formatWhen(entry.createdAt)}</Text>
              <Text numberOfLines={3} style={[styles.excerpt, { color: colors.ink, fontFamily: fonts.body }]}>
                {entry.prompt}
              </Text>
              <View style={styles.row}>
                <Button
                  label="Use again"
                  accessibilityLabel={`Use again: ${taskSummary(entry.fields.task)}`}
                  variant="secondary"
                  onPress={() => {
                    dispatch({ type: 'restoreHistory', id: entry.id });
                    router.push('/');
                  }}
                  style={styles.flex}
                />
                <Button
                  label="Copy"
                  accessibilityLabel={`Copy again: ${taskSummary(entry.fields.task)}`}
                  onPress={() => {
                    void copyText(entry.prompt).then((ok) => {
                      setNotice(ok ? 'Prompt copied to the clipboard.' : "Couldn't copy that prompt.");
                    });
                  }}
                  style={styles.flex}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <Dialog visible={confirm} title="Clear history?" onDismiss={() => setConfirm(false)}>
        <Text style={{ color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 22 }}>
          This removes the prompts you copied from this device. Saved templates stay.
        </Text>
        <Button
          label="Clear history"
          variant="danger"
          onPress={() => {
            dispatch({ type: 'clearHistory' });
            setConfirm(false);
          }}
        />
        <Button label="Cancel" variant="quiet" onPress={() => setConfirm(false)} />
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
  header: {
    gap: 12,
  },
  empty: {
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  task: {
    fontSize: 17,
    lineHeight: 23,
  },
  when: {
    fontSize: 13,
  },
  excerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  live: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});
