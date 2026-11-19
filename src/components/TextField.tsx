import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  multiline = false,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
  error?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>
        {label}
        {required ? <Text style={{ color: colors.accent }}> · required</Text> : null}
      </Text>
      {hint ? <Text style={[styles.hint, { color: colors.muted, fontFamily: fonts.body }]}>{hint}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          {
            color: colors.ink,
            backgroundColor: colors.elevated,
            borderColor: error ? colors.danger : colors.line,
            fontFamily: fonts.body,
          },
        ]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger, fontFamily: fonts.body }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 15,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 112,
  },
  error: {
    fontSize: 14,
  },
});
