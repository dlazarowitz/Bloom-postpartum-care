import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { differenceInWeeks, differenceInDays, subWeeks, isAfter } from 'date-fns';
import { useTheme } from '../src/contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/utils/theme';
import { useAppStore } from '../src/store/useAppStore';
import { sendChat } from '../src/services/api';

type AppointmentType = 'pediatrician' | 'obgyn' | 'lactation' | 'therapist';

interface AppointmentOption {
  key: AppointmentType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

function getAppointmentOptions(
  colors: ReturnType<typeof useTheme>['colors'],
): AppointmentOption[] {
  return [
    {
      key: 'pediatrician',
      label: 'Pediatrician Visit',
      icon: 'happy',
      color: colors.info,
      description: 'Well-baby check, growth, and development',
    },
    {
      key: 'obgyn',
      label: 'OB/GYN Follow-up',
      icon: 'woman',
      color: colors.primary,
      description: 'Postpartum recovery and health check',
    },
    {
      key: 'lactation',
      label: 'Lactation Consultant',
      icon: 'nutrition',
      color: colors.secondary,
      description: 'Feeding support and guidance',
    },
    {
      key: 'therapist',
      label: 'Therapist / Mental Health',
      icon: 'bulb',
      color: '#8B7EC8',
      description: 'Emotional wellbeing and support',
    },
  ];
}

export default function AppointmentPrepScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const feedingEntries = useAppStore((s) => s.feedingEntries);
  const diaperEntries = useAppStore((s) => s.diaperEntries);
  const sleepEntries = useAppStore((s) => s.sleepEntries);
  const moodEntries = useAppStore((s) => s.moodEntries);
  const milestones = useAppStore((s) => s.milestones);

  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const appointmentOptions = getAppointmentOptions(colors);
  const styles = getStyles(colors);

  // Computed data
  const weeksPostpartum = useMemo(() => {
    if (!profile.babyBirthDate) return null;
    return differenceInWeeks(new Date(), new Date(profile.babyBirthDate));
  }, [profile.babyBirthDate]);

  const daysPostpartum = useMemo(() => {
    if (!profile.babyBirthDate) return null;
    return differenceInDays(new Date(), new Date(profile.babyBirthDate));
  }, [profile.babyBirthDate]);

  const twoWeeksAgo = useMemo(() => subWeeks(new Date(), 2), []);

  // Recent data summaries (last 2 weeks)
  const recentFeedings = useMemo(
    () =>
      feedingEntries.filter((e) =>
        isAfter(new Date(e.startTime), twoWeeksAgo),
      ),
    [feedingEntries, twoWeeksAgo],
  );

  const recentDiapers = useMemo(
    () =>
      diaperEntries.filter((e) =>
        isAfter(new Date(e.time), twoWeeksAgo),
      ),
    [diaperEntries, twoWeeksAgo],
  );

  const recentSleep = useMemo(
    () =>
      sleepEntries.filter((e) =>
        isAfter(new Date(e.startTime), twoWeeksAgo),
      ),
    [sleepEntries, twoWeeksAgo],
  );

  const recentMoods = useMemo(
    () =>
      moodEntries.filter((e) =>
        isAfter(new Date(e.date), twoWeeksAgo),
      ),
    [moodEntries, twoWeeksAgo],
  );

  const achievedMilestones = useMemo(
    () => milestones.filter((m) => m.achieved),
    [milestones],
  );

  // Average daily feeding count
  const avgDailyFeedings = useMemo(() => {
    if (recentFeedings.length === 0) return 0;
    const days = Math.max(1, Math.ceil(
      (new Date().getTime() - twoWeeksAgo.getTime()) / (1000 * 60 * 60 * 24),
    ));
    return Math.round((recentFeedings.length / days) * 10) / 10;
  }, [recentFeedings, twoWeeksAgo]);

  // Average daily sleep hours
  const avgDailySleepHours = useMemo(() => {
    const completedSleep = recentSleep.filter((e) => e.endTime);
    if (completedSleep.length === 0) return 0;
    const totalMs = completedSleep.reduce((sum, e) => {
      const start = new Date(e.startTime).getTime();
      const end = new Date(e.endTime!).getTime();
      return sum + (end - start);
    }, 0);
    const days = Math.max(1, Math.ceil(
      (new Date().getTime() - twoWeeksAgo.getTime()) / (1000 * 60 * 60 * 24),
    ));
    return Math.round((totalMs / (1000 * 60 * 60) / days) * 10) / 10;
  }, [recentSleep, twoWeeksAgo]);

  // Average mood score
  const avgMood = useMemo(() => {
    if (recentMoods.length === 0) return null;
    const total = recentMoods.reduce((sum, e) => sum + e.mood, 0);
    return Math.round((total / recentMoods.length) * 10) / 10;
  }, [recentMoods]);

  // Flags
  const lowMoodEntries = useMemo(
    () => recentMoods.filter((e) => e.mood <= 2),
    [recentMoods],
  );

  const hasLowMoodFlag = lowMoodEntries.length > 0;
  const hasLowFeedingFlag = avgDailyFeedings > 0 && avgDailyFeedings < 6;
  const hasSleepAnomalyFlag = avgDailySleepHours > 0 && (avgDailySleepHours < 10 || avgDailySleepHours > 20);

  const getRelevantDataSummary = (type: AppointmentType): string => {
    const parts: string[] = [];

    if (type === 'pediatrician') {
      parts.push(`Feeding: ${recentFeedings.length} feedings in the last 2 weeks (avg ${avgDailyFeedings}/day)`);
      const wetCount = recentDiapers.filter((d) => d.type === 'wet' || d.type === 'both').length;
      const dirtyCount = recentDiapers.filter((d) => d.type === 'dirty' || d.type === 'both').length;
      parts.push(`Diapers: ${wetCount} wet, ${dirtyCount} dirty in last 2 weeks`);
      parts.push(`Sleep: avg ${avgDailySleepHours} hours/day`);
      parts.push(`Milestones achieved: ${achievedMilestones.length} of ${milestones.length}`);
    } else if (type === 'obgyn') {
      if (avgMood !== null) parts.push(`Average mood score: ${avgMood}/5`);
      if (hasLowMoodFlag) parts.push(`Low mood entries (score <=2): ${lowMoodEntries.length} in last 2 weeks`);
      parts.push(`Feeding type distribution: ${recentFeedings.length} total feedings logged`);
    } else if (type === 'lactation') {
      parts.push(`Feeding: ${recentFeedings.length} feedings in last 2 weeks (avg ${avgDailyFeedings}/day)`);
      const breastCount = recentFeedings.filter((f) => f.type === 'breast_left' || f.type === 'breast_right').length;
      const bottleCount = recentFeedings.filter((f) => f.type === 'bottle').length;
      const formulaCount = recentFeedings.filter((f) => f.type === 'formula').length;
      parts.push(`Breast: ${breastCount}, Bottle: ${bottleCount}, Formula: ${formulaCount}`);
      const wetCount = recentDiapers.filter((d) => d.type === 'wet' || d.type === 'both').length;
      parts.push(`Wet diapers (hydration indicator): ${wetCount} in last 2 weeks`);
    } else if (type === 'therapist') {
      if (avgMood !== null) parts.push(`Average mood score: ${avgMood}/5`);
      if (hasLowMoodFlag) parts.push(`Low mood entries (score <=2): ${lowMoodEntries.length} in last 2 weeks`);
      if (recentMoods.length > 0) {
        const allFeelings = recentMoods.flatMap((m) => m.feelings);
        const feelingCounts: Record<string, number> = {};
        allFeelings.forEach((f) => {
          feelingCounts[f] = (feelingCounts[f] || 0) + 1;
        });
        const topFeelings = Object.entries(feelingCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([f]) => f);
        if (topFeelings.length > 0) parts.push(`Most common feelings: ${topFeelings.join(', ')}`);
      }
      parts.push(`Sleep: avg ${avgDailySleepHours} hours/day (baby)`);
    }

    return parts.join('\n');
  };

  const handleGenerateQuestions = async () => {
    if (!selectedType) return;

    setIsGenerating(true);
    setAiResponse(null);

    const option = appointmentOptions.find((o) => o.key === selectedType)!;
    const dataSummary = getRelevantDataSummary(selectedType);

    const babyAge = weeksPostpartum !== null
      ? `Baby is ${weeksPostpartum} weeks old (${daysPostpartum} days).`
      : 'Baby age unknown.';

    const babyName = profile.babyName ? `Baby's name: ${profile.babyName}.` : '';
    const deliveryInfo = profile.deliveryType
      ? `Delivery type: ${profile.deliveryType === 'csection' ? 'cesarean section' : 'vaginal'}.`
      : '';

    const prompt = `You are a helpful postpartum care assistant. A parent is preparing for a ${option.label} appointment.

${babyName} ${babyAge} ${deliveryInfo}

Here is relevant tracked data from the last 2 weeks:
${dataSummary}

${hasLowMoodFlag ? 'NOTE: Parent has logged low mood scores (2 or below) recently, indicating potential mental health concerns.' : ''}
${hasLowFeedingFlag ? 'NOTE: Average daily feedings seem low, which may indicate feeding concerns.' : ''}
${hasSleepAnomalyFlag ? 'NOTE: Baby sleep patterns may be outside normal range.' : ''}

Please generate:
1. A personalized list of 5-7 specific questions the parent should consider asking their ${option.label.toLowerCase()} at this appointment, based on the baby's age and tracked data.
2. 2-3 specific things they should mention to their provider based on the data patterns.

Format each question as a numbered list. Be specific and practical, not generic. Base your suggestions on the actual data provided.`;

    try {
      const response = await sendChat({
        messages: [{ role: 'user', content: prompt }],
      });
      setAiResponse(response.message);
    } catch (error) {
      Alert.alert(
        'Unable to Generate',
        'Could not connect to the AI assistant. Please check your connection and try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.typeSelectorTitle}>What type of appointment?</Text>
      <Text style={styles.typeSelectorSubtitle}>
        Select your upcoming visit to get tailored preparation
      </Text>
      <View style={styles.typeGrid}>
        {appointmentOptions.map((option) => {
          const isSelected = selectedType === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.typeCard,
                isSelected && styles.typeCardSelected,
                isSelected && { borderColor: option.color },
              ]}
              onPress={() => {
                setSelectedType(option.key);
                setAiResponse(null);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.typeIconContainer,
                  { backgroundColor: option.color + '18' },
                  isSelected && { backgroundColor: option.color + '28' },
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={28}
                  color={option.color}
                />
              </View>
              <Text style={[styles.typeLabel, isSelected && { color: option.color }]}>
                {option.label}
              </Text>
              <Text style={styles.typeDescription}>{option.description}</Text>
              {isSelected && (
                <View style={[styles.selectedIndicator, { backgroundColor: option.color }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderDataSummary = () => {
    if (!selectedType) return null;

    const option = appointmentOptions.find((o) => o.key === selectedType)!;

    const getSummaryItems = (): { icon: string; label: string; value: string; color: string }[] => {
      switch (selectedType) {
        case 'pediatrician':
          return [
            {
              icon: 'nutrition-outline',
              label: 'Feedings (2 wks)',
              value: `${recentFeedings.length} total (avg ${avgDailyFeedings}/day)`,
              color: colors.primary,
            },
            {
              icon: 'water-outline',
              label: 'Diapers (2 wks)',
              value: `${recentDiapers.length} total`,
              color: colors.info,
            },
            {
              icon: 'moon-outline',
              label: 'Avg Sleep',
              value: avgDailySleepHours > 0 ? `${avgDailySleepHours} hrs/day` : 'No data',
              color: '#8B7EC8',
            },
            {
              icon: 'star-outline',
              label: 'Milestones',
              value: `${achievedMilestones.length} achieved`,
              color: colors.accent,
            },
          ];
        case 'obgyn':
          return [
            {
              icon: 'heart-outline',
              label: 'Avg Mood',
              value: avgMood !== null ? `${avgMood}/5` : 'No data',
              color: colors.primary,
            },
            {
              icon: 'alert-circle-outline',
              label: 'Low Mood Days',
              value: `${lowMoodEntries.length}`,
              color: hasLowMoodFlag ? colors.error : colors.success,
            },
            {
              icon: 'nutrition-outline',
              label: 'Feedings Logged',
              value: `${recentFeedings.length}`,
              color: colors.secondary,
            },
          ];
        case 'lactation':
          return [
            {
              icon: 'nutrition-outline',
              label: 'Total Feedings',
              value: `${recentFeedings.length} (2 wks)`,
              color: colors.primary,
            },
            {
              icon: 'ellipse-outline',
              label: 'Breast Feeds',
              value: `${recentFeedings.filter((f) => f.type === 'breast_left' || f.type === 'breast_right').length}`,
              color: colors.secondary,
            },
            {
              icon: 'flask-outline',
              label: 'Bottle / Formula',
              value: `${recentFeedings.filter((f) => f.type === 'bottle' || f.type === 'formula').length}`,
              color: colors.accent,
            },
            {
              icon: 'water-outline',
              label: 'Wet Diapers',
              value: `${recentDiapers.filter((d) => d.type === 'wet' || d.type === 'both').length}`,
              color: colors.info,
            },
          ];
        case 'therapist':
          return [
            {
              icon: 'heart-outline',
              label: 'Avg Mood',
              value: avgMood !== null ? `${avgMood}/5` : 'No data',
              color: '#8B7EC8',
            },
            {
              icon: 'alert-circle-outline',
              label: 'Low Mood Days',
              value: `${lowMoodEntries.length}`,
              color: hasLowMoodFlag ? colors.error : colors.success,
            },
            {
              icon: 'moon-outline',
              label: 'Baby Sleep Avg',
              value: avgDailySleepHours > 0 ? `${avgDailySleepHours} hrs/day` : 'No data',
              color: colors.info,
            },
          ];
        default:
          return [];
      }
    };

    const items = getSummaryItems();

    return (
      <View style={styles.dataSummaryContainer}>
        <View style={styles.dataSummaryHeader}>
          <Ionicons name="analytics-outline" size={20} color={option.color} />
          <Text style={styles.dataSummaryTitle}>Your Tracked Data</Text>
        </View>
        <Text style={styles.dataSummarySubtitle}>
          Summary from the last 2 weeks that will inform your prep questions
        </Text>
        <View style={styles.dataSummaryGrid}>
          {items.map((item, index) => (
            <View key={index} style={styles.dataSummaryItem}>
              <View style={[styles.dataSummaryIconWrap, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.dataSummaryLabel}>{item.label}</Text>
              <Text style={styles.dataSummaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderFlags = () => {
    if (!selectedType) return null;
    const flags: { icon: string; text: string; color: string }[] = [];

    if (hasLowMoodFlag) {
      flags.push({
        icon: 'warning-outline',
        text: `You logged ${lowMoodEntries.length} mood entries of 2 or below in the last 2 weeks. Consider discussing your emotional wellbeing with your provider.`,
        color: colors.warning,
      });
    }

    if (hasLowFeedingFlag && (selectedType === 'pediatrician' || selectedType === 'lactation')) {
      flags.push({
        icon: 'alert-circle-outline',
        text: `Average daily feedings (${avgDailyFeedings}/day) may be lower than expected. Discuss feeding patterns with your provider.`,
        color: colors.error,
      });
    }

    if (hasSleepAnomalyFlag && (selectedType === 'pediatrician' || selectedType === 'therapist')) {
      flags.push({
        icon: 'moon-outline',
        text: `Baby's average daily sleep (${avgDailySleepHours} hrs) may be outside the typical range. Mention sleep patterns to your provider.`,
        color: colors.info,
      });
    }

    if (flags.length === 0) return null;

    return (
      <View style={styles.flagsContainer}>
        <View style={styles.flagsHeader}>
          <Ionicons name="flag-outline" size={18} color={colors.warning} />
          <Text style={styles.flagsTitle}>Important: Mention to your provider</Text>
        </View>
        {flags.map((flag, index) => (
          <View key={index} style={styles.flagItem}>
            <View style={[styles.flagIconWrap, { backgroundColor: flag.color + '18' }]}>
              <Ionicons name={flag.icon as any} size={16} color={flag.color} />
            </View>
            <Text style={styles.flagText}>{flag.text}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderGenerateButton = () => {
    if (!selectedType) return null;
    const option = appointmentOptions.find((o) => o.key === selectedType)!;

    return (
      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: option.color }]}
        onPress={handleGenerateQuestions}
        activeOpacity={0.7}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.generateButtonText}>
          {isGenerating ? 'Generating...' : 'Generate Prep Questions'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAiResponse = () => {
    if (!aiResponse || !selectedType) return null;
    const option = appointmentOptions.find((o) => o.key === selectedType)!;

    return (
      <View style={styles.aiResponseContainer}>
        <View style={styles.aiResponseHeader}>
          <View style={[styles.aiIconWrap, { backgroundColor: option.color + '18' }]}>
            <Ionicons name="sparkles" size={18} color={option.color} />
          </View>
          <View style={styles.aiResponseHeaderText}>
            <Text style={styles.aiResponseTitle}>Your Prep Questions</Text>
            <Text style={styles.aiResponseSubtitle}>
              Personalized for your {option.label.toLowerCase()}
            </Text>
          </View>
        </View>
        <View style={styles.aiResponseDivider} />
        <Text style={styles.aiResponseText}>{aiResponse}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Appointment Prep</Text>
              <Text style={styles.headerSubtitle}>
                Let Bloom help you prepare for your next visit
              </Text>
            </View>
          </View>
          {weeksPostpartum !== null && (
            <View style={styles.ageBadge}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={styles.ageBadgeText}>
                {profile.babyName || 'Baby'} is {weeksPostpartum} weeks old
              </Text>
            </View>
          )}
        </View>

        {renderTypeSelector()}

        {selectedType && (
          <>
            {renderDataSummary()}
            {renderFlags()}
            {renderGenerateButton()}
            {isGenerating && (
              <View style={styles.generatingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.generatingText}>
                  Analyzing your data and preparing personalized questions...
                </Text>
              </View>
            )}
            {renderAiResponse()}
          </>
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>
            This is not medical advice. The questions and suggestions generated are meant to
            help you prepare for your appointment and facilitate productive conversations with
            your healthcare provider. Always follow your provider's professional guidance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xxl + spacing.xl,
    },

    // Header
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    ageBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    ageBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.primary,
    },

    // Type selector
    typeSelectorContainer: {
      padding: spacing.lg,
    },
    typeSelectorTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    typeSelectorSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    typeCard: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 2,
      borderColor: colors.borderLight,
      ...shadows.sm,
      position: 'relative',
    },
    typeCardSelected: {
      borderWidth: 2,
      ...shadows.md,
    },
    typeIconContainer: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    typeLabel: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    typeDescription: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    selectedIndicator: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Data summary
    dataSummaryContainer: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...shadows.sm,
    },
    dataSummaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    dataSummaryTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
    },
    dataSummarySubtitle: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
    dataSummaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    dataSummaryItem: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.sm + 2,
      alignItems: 'center',
    },
    dataSummaryIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    dataSummaryLabel: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      fontWeight: fontWeight.medium,
      marginBottom: 2,
      textAlign: 'center',
    },
    dataSummaryValue: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
    },

    // Flags
    flagsContainer: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.warning + '40',
      borderLeftWidth: 4,
      borderLeftColor: colors.warning,
    },
    flagsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    flagsTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
    },
    flagItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    flagIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    flagText: {
      flex: 1,
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },

    // Generate button
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      paddingVertical: spacing.md + 2,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
      ...shadows.md,
    },
    generateButtonText: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: '#FFFFFF',
    },

    // Generating state
    generatingContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    generatingText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.md,
      textAlign: 'center',
    },

    // AI response
    aiResponseContainer: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...shadows.md,
    },
    aiResponseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    aiIconWrap: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiResponseHeaderText: {
      flex: 1,
    },
    aiResponseTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    aiResponseSubtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
    },
    aiResponseDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    aiResponseText: {
      fontSize: fontSize.md,
      color: colors.text,
      lineHeight: 24,
    },

    // Disclaimer
    disclaimer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    disclaimerText: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      lineHeight: 18,
    },
  });
}
