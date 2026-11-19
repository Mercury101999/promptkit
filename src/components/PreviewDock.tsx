import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { copyText, shareIsAvailable, shareText } from '@/lib/clipboard';
import { assemblePrompt, sectionCount } from '@/lib/prompt';
import { createId } from '@/lib/id';
import { hasTask } from '@/lib/fields';
import { usePromptStore } from '@/store/PromptStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export function PreviewDock({ wide = false }: { wide?: boolean }) {
  const { state, dispatch } = usePromptStore();
  const { colors, reducedMotion } = useAppTheme();
  const prompt = assemblePrompt(state.fields);
  const sections = sectionCount(state.fields);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const canShare = shareIsAvailable();

  async function onCopy() {
    if (!hasTask(state.fields) || !prompt) {
      setStatus('Add a task first.');
      setCopied(false);
      return;
    }
    const ok = await copyText(prompt);
    if (!ok) {
      setCopied(false);
      setStatus("Couldn't copy. Select the prompt and copy it manually.");
      setOpen(true);
      return;
    }
    dispatch({ type: 'recordCopy', prompt, id: createId(), now: new Date().toISOString() });
    setCopied(true);
    setStatus('Prompt copied to the clipboard.');
  }

  async function onShare() {
    if (!prompt) {
      setStatus('Add a task first.');
      return;
    }
    const result = await shareText(prompt);
    if (result === 'shared') setStatus('Share sheet opened.');
    if (result === 'unavailable') setStatus("Sharing isn't available here. Copy the prompt instead.");
  }

  const body = prompt || 'Add a task and the prompt will build itself here. Empty fields are left out.';

  return (
    <View style={[styles.dock, wide && styles.dockWide, { backgroundColor: colors.previewBg }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: colors.previewMuted, fontFamily: fonts.bodyMedium }]}>Live preview</Text>
        <Text style={[styles.count, { color: colors.previewMuted, fontFamily: fonts.body }]}>
          {sections === 1 ? '1 section' : `${sections} sections`}
        </Text>
      </View>
      <Text
        accessibilityLabel="Prompt preview"
        selectable
        numberOfLines={wide ? undefined : 8}
        style={[styles.preview, { color: prompt ? colors.previewInk : colors.previewMuted, fontFamily: fonts.body }]}>
        {body}
      </Text>
      <View style={styles.actions}>
        <Button
          label={copied ? 'Copied' : 'Copy prompt'}
          accessibilityLabel={copied ? 'Copied' : 'Copy prompt'}
          onPress={() => {
            void onCopy();
          }}
          disabled={!hasTask(state.fields)}
          style={styles.action}
        />
        {canShare ? (
          <Button
            label="Share"
            accessibilityLabel="Share prompt"
            variant="secondary"
            onPress={() => {
              void onShare();
            }}
            disabled={!hasTask(state.fields)}
            style={styles.share}
          />
        ) : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Read the full prompt" onPress={() => setOpen(true)} style={styles.expand}>
        <Text style={{ color: '#8FE0D8', fontFamily: fonts.bodyMedium, fontSize: 15 }}>Read the full prompt</Text>
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {status}
      </Text>

      <Modal visible={open} animationType={reducedMotion ? 'none' : 'slide'} onRequestClose={() => setOpen(false)}>
        <View style={[styles.full, { backgroundColor: colors.previewBg }]}>
          <Text accessibilityRole="header" style={[styles.fullTitle, { color: colors.previewInk, fontFamily: fonts.display }]}>
            Prompt
          </Text>
          <ScrollView contentContainerStyle={styles.fullScroll}>
            <Text selectable style={[styles.fullBody, { color: colors.previewInk, fontFamily: fonts.body }]}>
              {body}
            </Text>
          </ScrollView>
          <View style={styles.actions}>
            <Button
              label={copied ? 'Copied' : 'Copy prompt'}
              onPress={() => {
                void onCopy();
              }}
              disabled={!hasTask(state.fields)}
              style={styles.action}
            />
            <Button label="Close" variant="secondary" onPress={() => setOpen(false)} style={styles.share} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    borderRadius: 20,
    padding: 14,
    gap: 10,
    margin: 12,
  },
  dockWide: {
    margin: 0,
    flex: 1,
    borderRadius: 0,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  count: {
    fontSize: 13,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
  },
  share: {
    minWidth: 96,
  },
  expand: {
    minHeight: 44,
    justifyContent: 'center',
  },
  status: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  full: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  fullTitle: {
    fontSize: 32,
  },
  fullScroll: {
    paddingBottom: 20,
  },
  fullBody: {
    fontSize: 16,
    lineHeight: 24,
  },
});
