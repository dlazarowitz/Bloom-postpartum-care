import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../../src/utils/theme';

interface QuickAction {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  route: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Recovery Guide',
    description: 'Track your healing journey with personalized guidance',
    icon: 'heart',
    backgroundColor: colors.primaryLight,
    route: '/recovery',
  },
  {
    title: 'Baby Checklist',
    description: 'Stay organized with essential baby care tasks',
    icon: 'checkbox',
    backgroundColor: colors.secondaryLight,
    route: '/checklist',
  },
  {
    title: 'Ask Bloom AI',
    description: 'Get instant answers to your postpartum questions',
    icon: 'chatbubble-ellipses',
    backgroundColor: colors.accentLight,
    route: '/assistant',
  },
  {
    title: 'Meal Planning',
    description: 'Nourishing recipes for postpartum recovery',
    icon: 'restaurant',
    backgroundColor: colors.info + '20',
    route: '/meals',
  },
  {
    title: 'Baby Tracker',
    description: 'Log feedings, sleep, and diaper changes',
    icon: 'analytics',
    backgroundColor: '#E8D4F0',
    route: '/tracker',
  },
  {
    title: 'Mood Check-In',
    description: 'Monitor your emotional well-being daily',
    icon: 'happy',
    backgroundColor: colors.warning + '20',
    route: '/mood-check',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to Bloom</Text>
          <Text style={styles.subtitle}>Your postpartum care companion</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: action.backgroundColor }]}
              onPress={() => handleCardPress(action.route)}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons
                  name={action.icon}
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Resources */}
        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Ionicons
              name="call"
              size={20}
              color={colors.error}
            />
            <Text style={styles.emergencyTitle}>Emergency Resources</Text>
          </View>
          <Text style={styles.emergencyNote}>
            If you or someone you know is struggling, help is available 24/7.
          </Text>

          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyName}>
              Postpartum Support International
            </Text>
            <Text style={styles.emergencyPhone}>1-800-944-4773</Text>
          </View>

          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyName}>Crisis Lifeline</Text>
            <Text style={styles.emergencyPhone}>988</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.regular as any,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  card: {
    width: '48%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emergencySection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
    ...shadows.sm,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold as any,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  emergencyNote: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emergencyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emergencyPhone: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: colors.primary,
  },
});
