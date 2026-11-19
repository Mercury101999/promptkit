import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export function Dialog({
  visible,
  title,
  children,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onDismiss: () => void;
}) {
  const { colors, reducedMotion } = useAppTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onDismiss}
      accessibilityViewIsModal>
      <Pressable
        accessibilityLabel="Dismiss dialog"
        onPress={onDismiss}
        style={[styles.backdrop, { backgroundColor: 'rgba(18, 20, 16, 0.46)' }]}>
        <Pressable
          accessibilityLabel={title}
          onPress={() => undefined}
          style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.line }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.ink, fontFamily: fonts.display }]}>
            {title}
          </Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ScreenIntro({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.intro}>
      <Text accessibilityRole="header" style={[styles.screenTitle, { color: colors.ink, fontFamily: fonts.display }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fonts.body }]}>{subtitle}</Text>
    </View>
  );
}

export function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.accent, fontFamily: fonts.bodyBold }]}>
        {title}
      </Text>
      {hint ? <Text style={[styles.hint, { color: colors.muted, fontFamily: fonts.body }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    maxHeight: '88%',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  intro: {
    gap: 4,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    gap: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
});
