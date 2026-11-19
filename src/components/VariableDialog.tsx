import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { TextField } from '@/components/TextField';
import { humanizeVariable, variableValuesComplete } from '@/lib/variables';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

const LONG_NAMES = /context|post|background|code|email|notes|source|facts|checks|responsibilities|dont|dos|findings/;

export function VariableDialog({
  title,
  names,
  visible,
  onCancel,
  onSubmit,
}: {
  title: string;
  names: string[];
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  return (
    <Dialog visible={visible} title={title} onDismiss={onCancel}>
      {visible ? (
        <VariableForm key={names.join('\n')} names={names} onCancel={onCancel} onSubmit={onSubmit} />
      ) : null}
    </Dialog>
  );
}

function VariableForm({
  names,
  onCancel,
  onSubmit,
}: {
  names: string[];
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const { colors } = useAppTheme();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(names.map((name) => [name, ''])),
  );
  const [error, setError] = useState('');

  return (
    <>
      <Text style={[styles.help, { color: colors.muted, fontFamily: fonts.body }]}>
        This template has blanks. Fill them in and PromptKit builds the prompt.
      </Text>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.gap}>
          {names.map((name) => (
            <TextField
              key={name}
              label={humanizeVariable(name)}
              value={values[name] ?? ''}
              onChangeText={(text) => setValues((current) => ({ ...current, [name]: text }))}
              placeholder={name}
              multiline={name.length > 18 || LONG_NAMES.test(name)}
            />
          ))}
        </View>
      </ScrollView>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.danger, fontFamily: fonts.body }}>
          {error}
        </Text>
      ) : null}
      <Button
        label="Build prompt"
        onPress={() => {
          if (!variableValuesComplete(names, values)) {
            setError('Fill every blank. Empty ones would be left in the prompt.');
            return;
          }
          const trimmed: Record<string, string> = {};
          for (const name of names) trimmed[name] = (values[name] ?? '').trim();
          onSubmit(trimmed);
        }}
      />
      <Button label="Cancel" variant="quiet" onPress={onCancel} />
    </>
  );
}

const styles = StyleSheet.create({
  help: {
    fontSize: 15,
    lineHeight: 21,
  },
  scroll: {
    maxHeight: 360,
  },
  gap: {
    gap: 12,
    paddingBottom: 4,
  },
});
