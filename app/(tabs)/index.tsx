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
import { useTheme } from '../../src/contexts/ThemeContext';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../../src/utils/theme';
import { useAppStore } from '../../src/store/useAppStore';
import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface QuickAction {
  title: string;
  description: string;
  icon: IoniconsName;
  backgroundColor: string;
  route: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const profile = useAppStore((s) => s.profile);

  const babyAge = profile.babyBirthDate
    ? {
        weeks: differenceInWeeks(new Date(), parseISO(profile.babyBirthDate)),
        days: differenceInDays(new Date(), parseISO(profile.babyBirthDate)),
      }
    : null;

  const quickActions: QuickAction[] = [
    {
      title: 'Baby Tracker',
      description: 'Log feedings, sleep, and diaper changes',
      icon: 'analytics',
      backgroundColor: isDark ? colors.primaryBg : colors.primaryLight,
      route: '/tracker',
    },
    {
      title: 'Ask Bloom AI',
      description: 'Get instant answers to your questions',
      icon: 'chatbubble-ellipses',
      backgroundColor: isDark ? colors.secondaryBg : colors.accentLight,
      route: '/assistant',
    },
    {
      title: 'Care Team',
      description: 'Your providers, one tap away',
      icon: 'people',
      backgroundColor: isDark ? '#1F2A2E' : colors.info + '20',
      route: '/care-team',
    },
    {
      title: 'Insights',
      description: 'Trends and patterns at a glance',
      icon: 'stats-chart',
      backgroundColor: isDark ? '#2A1F2E' : '#E8D4F0',
      route: '/insights',
    },
    {
      title: 'Recovery Guide',
      description: 'Track your healing journey',
      icon: 'heart',
      backgroundColor: isDark ? colors.primaryBg : colors.primaryLight,
      route: '/recovery',
    },
    {
      title: 'Meal Planning',
      description: 'Nourishing recipes for recovery',
      icon: 'restaurant',
      backgroundColor: isDark ? colors.secondaryBg : colors.secondaryLight,
      route: '/meals',
    },
    {
      title: 'Baby Checklist',
      description: 'Essential items organized by category',
      icon: 'checkbox',
      backgroundColor: isDark ? '#2E2A1F' : colors.accentLight,
      route: '/checklist',
    },
    {
      title: 'Learning Hub',
      description: 'Evidence-based guides for your journey',
      icon: 'book',
      backgroundColor: isDark ? '#1F2E2A' : colors.secondaryLight,
      route: '/library',
    },
    {
      title: 'Mood Check-In',
      description: 'Monitor your emotional well-being',
      icon: 'happy',
      backgroundColor: isDark ? '#2E2E1F' : colors.warning + '20',
      route: '/mood-check',
    },
    {
      title: 'Appointment Prep',
      description: 'AI-powered visit preparation',
      icon: 'clipboard',
      backgroundColor: isDark ? '#1F2A2E' : colors.info + '20',
      route: '/appointment-prep',
    },
  ];

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                {profile.name ? `Hi, ${profile.name}` : 'Welcome to Bloom'}
              </Text>
              <Text style={styles.subtitle}>
                {babyAge
                  ? `${profile.babyName || 'Baby'} is ${babyAge.weeks} weeks old (${babyAge.days} days)`
                  : 'Your postpartum care companion'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings' as any)}
            >
              <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
            <Ionicons name="call" size={20} color={colors.error} />
            <Text style={styles.emergencyTitle}>Emergency Resources</Text>
          </View>
          <Text style={styles.emergencyNote}>
            If you or someone you know is struggling, help is available 24/7.
          </Text>

          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyName}>Postpartum Support International</Text>
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

function makeStyles(colors: any) {
  return StyleSheet.create({
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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    greeting: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      fontWeight: fontWeight.regular,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.sm,
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
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    cardTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
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
      fontWeight: fontWeight.semibold,
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
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    emergencyPhone: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.primary,
    },
  });
}
