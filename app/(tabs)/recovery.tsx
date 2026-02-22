import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
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

interface RecoveryPath {
  title: string;
  description: string;
  timeline: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  accentColor: string;
  backgroundColor: string;
}

const recoveryPaths: RecoveryPath[] = [
  {
    title: 'Vaginal Delivery Recovery',
    description:
      'A comprehensive guide to healing after vaginal birth. Learn about perineal care, pelvic floor recovery, managing discomfort, and when to resume daily activities safely.',
    timeline: '6–8 weeks',
    icon: 'flower',
    route: '/recovery/vaginal',
    accentColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  {
    title: 'C-Section Recovery',
    description:
      'Recovery guidance after a major abdominal surgery. Covers incision care, safe movement techniques, pain management, and gradual return to physical activity.',
    timeline: '8–12 weeks',
    icon: 'medkit',
    route: '/recovery/csection',
    accentColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
];

export default function RecoveryScreen() {
  const router = useRouter();

  const handleViewGuide = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Guide</Text>
          <Text style={styles.subtitle}>
            Choose your recovery path to get personalized guidance and support
            through your healing journey.
          </Text>
        </View>

        {/* Recovery Path Cards */}
        {recoveryPaths.map((path, index) => (
          <View
            key={index}
            style={[styles.card, { borderLeftColor: path.accentColor }]}
          >
            <View
              style={[
                styles.cardIconContainer,
                { backgroundColor: path.backgroundColor },
              ]}
            >
              <Ionicons
                name={path.icon}
                size={32}
                color={path.accentColor}
              />
            </View>

            <Text style={styles.cardTitle}>{path.title}</Text>
            <Text style={styles.cardDescription}>{path.description}</Text>

            <View style={styles.timelineContainer}>
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={styles.timelineText}>
                Estimated recovery: {path.timeline}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.viewGuideButton, { backgroundColor: path.accentColor }]}
              onPress={() => handleViewGuide(path.route)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewGuideButtonText}>View Guide</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.surface}
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* Disclaimer Note */}
        <View style={styles.noteContainer}>
          <Ionicons
            name="information-circle"
            size={22}
            color={colors.info}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            Every body heals differently. These timelines are general guides.
            Always follow your healthcare provider's advice.
          </Text>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    ...shadows.md,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  timelineText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium as any,
    marginLeft: spacing.xs,
  },
  viewGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  viewGuideButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold as any,
    color: colors.surface,
    marginRight: spacing.sm,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  noteIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: fontWeight.medium as any,
  },
});
