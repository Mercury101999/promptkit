import { useState } from 'react';
import { usePathname } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ChipSelect } from '@/components/ChipSelect';
import { ScreenIntro } from '@/components/Dialog';
import { TextField } from '@/components/TextField';
import { copyText } from '@/lib/clipboard';
import { exportJsonFile, readPickedJson } from '@/lib/files';
import { createId } from '@/lib/id';
import { mergeTemplates, parseTemplateExport, serializeTemplates } from '@/lib/transfer';
import type { ThemePreference } from '@/lib/types';
import { usePromptStore } from '@/store/PromptStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { state, dispatch } = usePromptStore();
  const { colors, preference, setPreference } = useAppTheme();
  const pathname = usePathname();
  const [paste, setPaste] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function applyImport(raw: string) {
    const parsed = parseTemplateExport(raw, createId);
    if (!parsed.ok) {
      setError(parsed.error);
      setStatus('');
      return;
    }
    const merged = mergeTemplates(state.templates, parsed.value, createId);
    const added = merged.length - state.templates.length;
    dispatch({ type: 'importTemplates', templates: merged.slice(state.templates.length) });
    setError('');
    setStatus(added === 1 ? 'Imported 1 template.' : `Imported ${added} templates.`);
    setPaste('');
  }

  async function onExportFile() {
    try {
      const json = serializeTemplates(state.templates, new Date().toISOString());
      await exportJsonFile('promptkit-templates.json', json);
      setError('');
      setStatus(
        state.templates.length === 1
          ? 'Exported 1 template.'
          : `Exported ${state.templates.length} templates.`,
      );
    } catch (reason) {
      setStatus('');
      setError(reason instanceof Error ? reason.message : 'Could not export the file.');
    }
  }

  if (pathname !== '/settings') return null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenIntro title="Settings" subtitle="Appearance and a backup of the templates you saved." />

        <View style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
          <Text style={[styles.cardTitle, { color: colors.ink, fontFamily: fonts.display }]}>Appearance</Text>
          <ChipSelect label="Theme" options={THEMES} value={preference} onChange={(value) => value && setPreference(value)} />
          <Text style={[styles.note, { color: colors.muted, fontFamily: fonts.body }]}>
            System follows this device. Light and dark stay put until you change them.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
          <Text style={[styles.cardTitle, { color: colors.ink, fontFamily: fonts.display }]}>Backup</Text>
          <Text style={[styles.note, { color: colors.muted, fontFamily: fonts.body }]}>
            {state.templates.length === 1
              ? '1 saved template on this device.'
              : `${state.templates.length} saved templates on this device.`}{' '}
            Starter templates are built in and are not part of the file.
          </Text>
          <Button
            label={Platform.OS === 'web' ? 'Download JSON' : 'Share JSON file'}
            onPress={() => {
              void onExportFile();
            }}
          />
          <Button
            label="Copy JSON"
            variant="secondary"
            onPress={() => {
              const json = serializeTemplates(state.templates, new Date().toISOString());
              void copyText(json).then((ok) => {
                setError(ok ? '' : "Couldn't copy the JSON.");
                setStatus(ok ? 'Template JSON copied.' : '');
              });
            }}
          />
          <Button
            label="Import file"
            variant="secondary"
            onPress={() => {
              void readPickedJson()
                .then((text) => {
                  if (text === null) return;
                  applyImport(text);
                })
                .catch(() => {
                  setStatus('');
                  setError('Could not read that file.');
                });
            }}
          />
          <TextField
            label="Template JSON"
            value={paste}
            onChangeText={setPaste}
            placeholder='{"version":1,"templates":[]}'
            hint="Paste a backup here if you would rather not pick a file."
            multiline
            error={error}
          />
          <Button label="Import JSON" onPress={() => applyImport(paste)} />
        </View>

        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
          {status}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
          <Text style={[styles.cardTitle, { color: colors.ink, fontFamily: fonts.display }]}>About</Text>
          <Text style={[styles.note, { color: colors.ink, fontFamily: fonts.body }]}>PromptKit 1.0.0</Text>
          <Text style={[styles.note, { color: colors.muted, fontFamily: fonts.body }]}>
            Prompts, templates, and history stay on this device. PromptKit does not send them to a server, and it does not call an AI API.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  note: {
    fontSize: 15,
    lineHeight: 22,
  },
  status: {
    fontSize: 16,
    minHeight: 22,
  },
});
