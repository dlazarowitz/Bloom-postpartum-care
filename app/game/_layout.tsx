import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="play" />
      <Stack.Screen name="collection" />
      <Stack.Screen name="battle-pass" />
    </Stack>
  );
}
