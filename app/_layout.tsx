import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/utils/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      </Stack>
    </>
  );
}
