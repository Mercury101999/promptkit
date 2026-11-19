import type { ReactNode } from 'react';
import { View } from 'react-native';

function Frame({ color, children }: { color: string; children: ReactNode }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 24, height: 24 }}>
      {children}
    </View>
  );
}

export function BuildIcon({ color }: { color: string }) {
  return (
    <Frame color={color}>
      <View style={{ position: 'absolute', left: 2, right: 2, top: 2, bottom: 2, borderRadius: 5, borderWidth: 1.6, borderColor: color }} />
      <View style={{ position: 'absolute', left: 6, top: 7, width: 10, height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 6, top: 11, width: 12, height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 6, top: 15, width: 4, height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 12, top: 14, width: 2.5, height: 5, borderRadius: 1, backgroundColor: color }} />
    </Frame>
  );
}

export function TemplatesIcon({ color }: { color: string }) {
  return (
    <Frame color={color}>
      <View style={{ position: 'absolute', left: 5, right: 3, top: 3, height: 14, borderRadius: 3, borderWidth: 1.6, borderColor: color }} />
      <View style={{ position: 'absolute', left: 3, right: 5, top: 7, height: 14, borderRadius: 3, borderWidth: 1.6, borderColor: color, backgroundColor: 'transparent' }} />
    </Frame>
  );
}

export function HistoryIcon({ color }: { color: string }) {
  return (
    <Frame color={color}>
      <View style={{ position: 'absolute', left: 3, top: 3, width: 18, height: 18, borderRadius: 9, borderWidth: 1.6, borderColor: color }} />
      <View style={{ position: 'absolute', left: 11, top: 7, width: 1.8, height: 6, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 11, top: 12, width: 5, height: 1.8, backgroundColor: color }} />
    </Frame>
  );
}

export function SettingsIcon({ color }: { color: string }) {
  return (
    <Frame color={color}>
      <View style={{ position: 'absolute', left: 3, right: 3, top: 6, height: 1.8, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 3, right: 3, top: 11, height: 1.8, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 3, right: 3, top: 16, height: 1.8, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 7, top: 4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 13, top: 9, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 8, top: 14, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
    </Frame>
  );
}
