import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const palette = {
    primary: { backgroundColor: colors.accent, borderColor: colors.accent, color: colors.accentInk },
    secondary: { backgroundColor: colors.elevated, borderColor: colors.line, color: colors.ink },
    quiet: { backgroundColor: 'transparent', borderColor: 'transparent', color: colors.accent },
    danger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft, color: colors.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        },
        style,
      ]}>
      <Text style={[styles.label, { color: palette.color, fontFamily: fonts.bodyMedium }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
});
