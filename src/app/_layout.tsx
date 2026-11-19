import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PromptStoreProvider, usePromptStore } from '@/store/PromptStore';
import { useAppTheme } from '@/theme/useAppTheme';

import '@/global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PromptStoreProvider>
          <ThemedShell />
        </PromptStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const { ready } = usePromptStore();
  const { mode, colors } = useAppTheme();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
