import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { fontSize } from '../../src/utils/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingBottom: 4,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '500',
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: fontSize.xl },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'home' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'analytics' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Ask Bloom',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'chatbubble-ellipses' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="care-team"
        options={{
          title: 'Care Team',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'people' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'stats-chart' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      {/* These tabs are accessible from home but hidden from the tab bar */}
      <Tabs.Screen
        name="recovery"
        options={{
          href: null,
          title: 'Recovery',
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          href: null,
          title: 'Checklist',
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          href: null,
          title: 'Meals',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          href: null,
          title: 'Library',
        }}
      />
    </Tabs>
  );
}
