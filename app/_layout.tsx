import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { useAppStore } from '../src/store/useAppStore';

function RootNavigator() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const onboardingComplete = useAppStore((s) => s.profile.onboardingComplete);

  // Redirect to onboarding if not complete
  useEffect(() => {
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [onboardingComplete, segments]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="recovery/vaginal"
          options={{ title: 'Vaginal Recovery' }}
        />
        <Stack.Screen
          name="recovery/csection"
          options={{ title: 'C-Section Recovery' }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{ title: 'Recipe' }}
        />
        <Stack.Screen
          name="mood-check"
          options={{ title: 'Mood Check-In', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="appointment-prep"
          options={{ title: 'Appointment Prep' }}
        />
        <Stack.Screen
          name="game"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
