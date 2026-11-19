import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | '';
  onChange: (value: T | '') => void;
  optional?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.wrap}>
      <Text style={[styles.label, { color: colors.ink, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => onChange(selected && optional ? '' : option.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? colors.accent : colors.elevated,
                  borderColor: selected ? colors.accent : colors.line,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}>
              <Text
                style={{
                  color: selected ? colors.accentInk : colors.ink,
                  fontFamily: fonts.bodyMedium,
                  fontSize: 15,
                }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
