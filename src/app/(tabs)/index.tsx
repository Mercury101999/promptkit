import { useState } from 'react';
import { usePathname } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ChipSelect } from '@/components/ChipSelect';
import { Dialog, SectionHeading } from '@/components/Dialog';
import { PreviewDock } from '@/components/PreviewDock';
import { TextField } from '@/components/TextField';
import { Wordmark } from '@/components/Wordmark';
import { hasAnyContent, hasTask } from '@/lib/fields';
import { createId } from '@/lib/id';
import { LENGTHS, OUTPUT_FORMATS, TONE_PRESETS, type LengthOption, type OutputFormat } from '@/lib/types';
import { usePromptStore } from '@/store/PromptStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export default function BuilderScreen() {
  const { state, dispatch } = usePromptStore();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const wide = width >= 960;
  const [saveOpen, setSaveOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [name, setName] = useState('');
  const [saveError, setSaveError] = useState('');
  const fields = state.fields;

  function patch(patchFields: Partial<typeof fields>) {
    dispatch({ type: 'patchFields', patch: patchFields });
  }

  function requestClear() {
    if (!hasAnyContent(fields) && !state.editingId) return;
    setClearOpen(true);
  }

  function requestSave() {
    if (state.editingId) {
      if (!state.editingName.trim()) return;
      if (!hasTask(fields)) return;
      dispatch({ type: 'saveEdit', now: new Date().toISOString() });
      return;
    }
    setName('');
    setSaveError('');
    setSaveOpen(true);
  }

  if (pathname !== '/' && pathname !== '') return null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.columns, wide && styles.columnsWide]}>
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          <Wordmark />
          {state.editingId ? (
            <View style={[styles.banner, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
              <Text style={[styles.bannerLabel, { color: colors.accentSoftInk, fontFamily: fonts.bodyMedium }]}>
                Editing a saved template
              </Text>
              <TextField label="Template name" value={state.editingName} onChangeText={(value) => dispatch({ type: 'setEditingName', name: value })} />
              {!hasTask(fields) ? (
                <Text style={{ color: colors.danger, fontFamily: fonts.body }}>Add a task before saving.</Text>
              ) : null}
              <View style={styles.row}>
                <Button label="Save changes" onPress={requestSave} style={styles.flex} />
                <Button label="Cancel" variant="secondary" onPress={() => dispatch({ type: 'cancelEdit' })} style={styles.flex} />
              </View>
            </View>
          ) : null}

          <SectionHeading title="The job" />
          <TextField
            label="Role"
            value={fields.role}
            onChangeText={(role) => patch({ role })}
            placeholder="A calm IT help desk technician"
            hint="Who should answer. Optional."
          />
          <TextField
            label="Task"
            required
            value={fields.task}
            onChangeText={(task) => patch({ task })}
            placeholder="What should it do?"
            hint="The only field you have to fill."
            multiline
          />
          <TextField
            label="Context"
            value={fields.context}
            onChangeText={(context) => patch({ context })}
            placeholder="Facts, the job post, the error, the notes"
            hint="The material it should use."
            multiline
          />

          <SectionHeading title="Who it's for" />
          <TextField
            label="Audience"
            value={fields.audience}
            onChangeText={(audience) => patch({ audience })}
            placeholder="A hiring manager skimming on a phone"
          />
          <ChipSelect
            label="Tone"
            optional
            options={TONE_PRESETS.map((tone) => ({ value: tone, label: tone.replace(/\.$/, '') }))}
            value={TONE_PRESETS.find((tone) => tone === fields.tone) ?? ''}
            onChange={(tone) => patch({ tone })}
          />
          <TextField
            label="Tone, in your words"
            value={fields.tone}
            onChangeText={(tone) => patch({ tone })}
            placeholder="Warm, short, and specific"
            hint="A preset fills this in. You can rewrite it."
          />

          <SectionHeading title="The shape" />
          <ChipSelect
            label="Output format"
            optional
            options={OUTPUT_FORMATS}
            value={fields.format}
            onChange={(format) => patch({ format: format as OutputFormat | '' })}
          />
          <ChipSelect
            label="Length"
            optional
            options={LENGTHS}
            value={fields.length}
            onChange={(length) => patch({ length: length as LengthOption | '' })}
          />
          <TextField
            label="Length, in your words"
            value={fields.lengthCustom}
            onChangeText={(lengthCustom) => patch({ lengthCustom })}
            placeholder="Under 120 words"
            hint="If you type a length, it replaces the preset."
          />

          <SectionHeading
            title="How it should work"
            hint="Optional. Useful when the prompt is a brief for an agent you run."
          />
          <TextField
            label="Success criteria"
            value={fields.success}
            onChangeText={(success) => patch({ success })}
            placeholder="What done looks like"
            multiline
          />
          <TextField
            label="What to report back"
            value={fields.report}
            onChangeText={(report) => patch({ report })}
            placeholder="What changed, what is blocked, and the next step"
            multiline
          />
          <TextField
            label="When to ask first"
            value={fields.askFirst}
            onChangeText={(askFirst) => patch({ askFirst })}
            placeholder="Ask before deleting files, emailing anyone, or spending money"
            multiline
          />
          <TextField
            label="Constraints"
            value={fields.constraints}
            onChangeText={(constraints) => patch({ constraints })}
            placeholder="Do not invent facts. Do not mention that you are an AI."
            hint="Limits and things to avoid."
            multiline
          />
          <TextField
            label="Examples"
            value={fields.examples}
            onChangeText={(examples) => patch({ examples })}
            placeholder="Paste a short sample of the tone or format you want"
            multiline
          />

          <View style={styles.row}>
            <Button label="Clear" variant="secondary" onPress={requestClear} style={styles.flex} />
            {state.editingId ? null : (
              <Button label="Save template" onPress={requestSave} style={styles.flex} />
            )}
          </View>
        </ScrollView>
        <PreviewDock wide={wide} />
      </View>

      <Dialog visible={saveOpen} title="Save template" onDismiss={() => setSaveOpen(false)}>
        <TextField
          label="Template name"
          value={name}
          onChangeText={setName}
          placeholder="Weekly job search brief"
          hint="Blanks like {{company}} stay in the template until you use it."
          error={saveError}
        />
        <Button
          label="Save"
          onPress={() => {
            if (!name.trim()) {
              setSaveError('Name this template.');
              return;
            }
            if (!hasTask(fields)) {
              setSaveError('Add a task first. The other fields can stay empty.');
              return;
            }
            dispatch({ type: 'saveNewTemplate', name, id: createId(), now: new Date().toISOString() });
            setSaveOpen(false);
          }}
        />
        <Button label="Cancel" variant="quiet" onPress={() => setSaveOpen(false)} />
      </Dialog>

      <Dialog visible={clearOpen} title="Clear this prompt?" onDismiss={() => setClearOpen(false)}>
        <Text style={{ color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 22 }}>
          The form goes blank. Saved templates and history stay.
        </Text>
        <Button
          label="Clear prompt"
          variant="danger"
          onPress={() => {
            dispatch({ type: 'clearFields' });
            setClearOpen(false);
          }}
        />
        <Button label="Keep editing" variant="quiet" onPress={() => setClearOpen(false)} />
      </Dialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  columns: {
    flex: 1,
  },
  columnsWide: {
    flexDirection: 'row',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  banner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  bannerLabel: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
});
