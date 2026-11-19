import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export function Wordmark() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={[styles.mark, { backgroundColor: colors.previewBg }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.line, { backgroundColor: colors.previewInk }]} />
        <View style={[styles.lineShort, { backgroundColor: colors.previewMuted }]} />
        <View style={styles.cursorRow}>
          <View style={[styles.dot, { backgroundColor: colors.previewMuted }]} />
          <View style={[styles.cursor, { backgroundColor: '#2BB8B0' }]} />
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.name, { color: colors.ink, fontFamily: fonts.displayBold }]}>PromptKit</Text>
        <Text style={[styles.tag, { color: colors.muted, fontFamily: fonts.body }]}>A brief for a model or an agent.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 11,
    justifyContent: 'space-between',
  },
  line: {
    height: 4,
    width: 18,
    borderRadius: 2,
  },
  lineShort: {
    height: 4,
    width: 26,
    borderRadius: 2,
  },
  cursorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 2,
  },
  cursor: {
    width: 4,
    height: 8,
    borderRadius: 1,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 28,
    lineHeight: 32,
  },
  tag: {
    fontSize: 14,
    lineHeight: 18,
  },
});
