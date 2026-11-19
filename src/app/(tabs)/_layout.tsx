import { Tabs } from 'expo-router';

import { BuildIcon, HistoryIcon, SettingsIcon, TemplatesIcon } from '@/components/TabIcon';
import { useAppTheme } from '@/theme/useAppTheme';
import { fonts } from '@/theme/tokens';

export default function TabLayout() {
  const { colors } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          minHeight: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 12,
        },
        tabBarItemStyle: {
          minHeight: 48,
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Build',
          tabBarAccessibilityLabel: 'Build',
          tabBarIcon: ({ color }) => <BuildIcon color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarAccessibilityLabel: 'Templates',
          tabBarIcon: ({ color }) => <TemplatesIcon color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarAccessibilityLabel: 'History',
          tabBarIcon: ({ color }) => <HistoryIcon color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
