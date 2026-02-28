import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
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
import {
  format,
  subDays,
  startOfDay,
  differenceInMinutes,
  parseISO,
  isToday,
  differenceInWeeks,
} from 'date-fns';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mood level to display emoji */
function moodEmoji(mood: number): string {
  switch (mood) {
    case 1:
      return '😢';
    case 2:
      return '😟';
    case 3:
      return '😐';
    case 4:
      return '🙂';
    case 5:
      return '😊';
    default:
      return '—';
  }
}

/** Mood level to theme color key */
function moodColorKey(mood: number): string {
  switch (mood) {
    case 1:
      return 'mood1';
    case 2:
      return 'mood2';
    case 3:
      return 'mood3';
    case 4:
      return 'mood4';
    case 5:
      return 'mood5';
    default:
      return 'textMuted';
  }
}

/** Get the last 7 days as Date objects (today first, oldest last). Reversed at the end so oldest is first. */
function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(startOfDay(subDays(new Date(), i)));
  }
  return days;
}

/** Check if an ISO date string falls on a given day */
function isSameDay(isoString: string, day: Date): boolean {
  const d = startOfDay(parseISO(isoString));
  return d.getTime() === day.getTime();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InsightsScreen() {
  const { colors } = useTheme();
  const {
    feedingEntries,
    diaperEntries,
    sleepEntries,
    moodEntries,
    milestones,
    profile,
  } = useAppStore();

  const now = new Date();
  const last7Days = useMemo(() => getLast7Days(), []);

  // ---- Baby Age ----
  const babyAgeInfo = useMemo(() => {
    if (!profile.babyBirthDate) return null;
    const birth = parseISO(profile.babyBirthDate);
    const weeks = differenceInWeeks(now, birth);
    const totalDays = Math.floor(
      (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { weeks, days: totalDays };
  }, [profile.babyBirthDate]);

  // ---- Today's summary ----
  const todayFeedings = useMemo(
    () => feedingEntries.filter((e) => isToday(parseISO(e.startTime))),
    [feedingEntries]
  );

  const todayDiapers = useMemo(
    () => diaperEntries.filter((e) => isToday(parseISO(e.time))),
    [diaperEntries]
  );

  const todayDiaperBreakdown = useMemo(() => {
    let wet = 0;
    let dirty = 0;
    let both = 0;
    todayDiapers.forEach((e) => {
      if (e.type === 'wet') wet++;
      else if (e.type === 'dirty') dirty++;
      else if (e.type === 'both') both++;
    });
    return { wet, dirty, both };
  }, [todayDiapers]);

  const todaySleepHours = useMemo(() => {
    const todaySleep = sleepEntries.filter((e) =>
      isToday(parseISO(e.startTime))
    );
    let totalMinutes = 0;
    todaySleep.forEach((e) => {
      if (e.endTime) {
        totalMinutes += differenceInMinutes(
          parseISO(e.endTime),
          parseISO(e.startTime)
        );
      }
    });
    return totalMinutes / 60;
  }, [sleepEntries]);

  const latestMood = useMemo(() => {
    if (moodEntries.length === 0) return null;
    // moodEntries are prepended (newest first)
    const todayEntries = moodEntries.filter((e) =>
      isToday(parseISO(e.date))
    );
    if (todayEntries.length > 0) return todayEntries[0];
    // fallback to most recent
    return moodEntries[0];
  }, [moodEntries]);

  // ---- 7-Day Feeding Trend ----
  const feedingTrend = useMemo(() => {
    return last7Days.map((day) => {
      const count = feedingEntries.filter((e) =>
        isSameDay(e.startTime, day)
      ).length;
      return { day, count };
    });
  }, [feedingEntries, last7Days]);

  const feedingMax = useMemo(
    () => Math.max(...feedingTrend.map((d) => d.count), 1),
    [feedingTrend]
  );

  // ---- 7-Day Sleep Trend ----
  const sleepTrend = useMemo(() => {
    return last7Days.map((day) => {
      const daySleep = sleepEntries.filter((e) =>
        isSameDay(e.startTime, day)
      );
      let totalMinutes = 0;
      daySleep.forEach((e) => {
        if (e.endTime) {
          totalMinutes += differenceInMinutes(
            parseISO(e.endTime),
            parseISO(e.startTime)
          );
        }
      });
      return { day, hours: totalMinutes / 60 };
    });
  }, [sleepEntries, last7Days]);

  const sleepMax = useMemo(
    () => Math.max(...sleepTrend.map((d) => d.hours), 1),
    [sleepTrend]
  );

  /** Return a color based on sleep hours */
  function sleepBarColor(hours: number): string {
    if (hours >= 7) return colors.success;
    if (hours >= 4) return colors.warning;
    return colors.error;
  }

  // ---- 7-Day Mood Trend ----
  const moodTrend = useMemo(() => {
    return last7Days.map((day) => {
      const entry = moodEntries.find((e) => isSameDay(e.date, day));
      return { day, mood: entry ? entry.mood : null };
    });
  }, [moodEntries, last7Days]);

  // ---- Milestones ----
  const milestonesTotal = milestones.length;
  const milestonesAchieved = milestones.filter((m) => m.achieved).length;
  const milestonePercent =
    milestonesTotal > 0
      ? Math.round((milestonesAchieved / milestonesTotal) * 100)
      : 0;

  // ---- Dynamic styles that depend on theme colors ----
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
        },
        headerTitle: {
          fontSize: fontSize.title,
          fontWeight: fontWeight.bold,
          color: colors.text,
        },
        headerSubtitle: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          marginTop: spacing.xs,
        },
        // Baby age banner
        ageBanner: {
          backgroundColor: colors.primaryBg,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
        },
        ageBannerText: {
          marginLeft: spacing.sm,
          flex: 1,
        },
        ageBannerTitle: {
          fontSize: fontSize.lg,
          fontWeight: fontWeight.semibold,
          color: colors.primary,
        },
        ageBannerDays: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          marginTop: 2,
        },
        ageHint: {
          backgroundColor: colors.surfaceSecondary,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
        },
        ageHintText: {
          fontSize: fontSize.sm,
          color: colors.textMuted,
          marginLeft: spacing.sm,
          flex: 1,
        },
        // Section card
        card: {
          backgroundColor: colors.surface,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.sm,
        },
        cardHeader: {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          marginBottom: spacing.md,
        },
        cardHeaderTitle: {
          fontSize: fontSize.lg,
          fontWeight: fontWeight.semibold,
          color: colors.text,
          marginLeft: spacing.sm,
        },
        // Today summary row
        summaryRow: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
        },
        summaryCard: {
          flex: 1,
          backgroundColor: colors.surfaceSecondary,
          borderRadius: borderRadius.md,
          padding: spacing.sm,
          marginHorizontal: spacing.xs / 2,
          alignItems: 'center' as const,
        },
        summaryValue: {
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          color: colors.text,
          marginTop: spacing.xs,
        },
        summaryLabel: {
          fontSize: fontSize.xs,
          color: colors.textSecondary,
          marginTop: 2,
          textAlign: 'center' as const,
        },
        summarySubLabel: {
          fontSize: 10,
          color: colors.textMuted,
          marginTop: 1,
          textAlign: 'center' as const,
        },
        // Bar chart
        chartContainer: {
          flexDirection: 'row' as const,
          alignItems: 'flex-end' as const,
          justifyContent: 'space-between' as const,
          height: 150,
          paddingTop: spacing.sm,
        },
        barWrapper: {
          flex: 1,
          alignItems: 'center' as const,
          justifyContent: 'flex-end' as const,
          height: '100%' as const,
        },
        barCount: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.semibold,
          color: colors.text,
          marginBottom: spacing.xs,
        },
        barDayLabel: {
          fontSize: fontSize.xs,
          color: colors.textMuted,
          marginTop: spacing.xs,
        },
        // Mood trend row
        moodRow: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
        },
        moodDotWrapper: {
          alignItems: 'center' as const,
          flex: 1,
        },
        moodDot: {
          width: 28,
          height: 28,
          borderRadius: 14,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        },
        moodDotEmpty: {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: colors.border,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        },
        moodDotLabel: {
          fontSize: fontSize.xs,
          color: colors.textMuted,
          marginTop: spacing.xs,
        },
        moodDotValue: {
          fontSize: 13,
          color: colors.textOnPrimary,
          fontWeight: fontWeight.bold,
        },
        // Diaper breakdown
        diaperRow: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
          alignItems: 'center' as const,
        },
        diaperItem: {
          alignItems: 'center' as const,
        },
        diaperValue: {
          fontSize: fontSize.xxl,
          fontWeight: fontWeight.bold,
          color: colors.text,
        },
        diaperLabel: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          marginTop: spacing.xs,
        },
        diaperDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          marginBottom: spacing.xs,
        },
        // Milestones progress
        milestoneText: {
          fontSize: fontSize.md,
          color: colors.text,
          fontWeight: fontWeight.medium,
          marginBottom: spacing.sm,
        },
        milestonePercent: {
          fontSize: fontSize.sm,
          color: colors.textSecondary,
          marginTop: spacing.xs,
          textAlign: 'right' as const,
        },
        progressBarTrack: {
          height: 10,
          backgroundColor: colors.borderLight,
          borderRadius: 5,
          overflow: 'hidden' as const,
        },
        progressBarFill: {
          height: 10,
          backgroundColor: colors.success,
          borderRadius: 5,
        },
        // Empty state
        emptyText: {
          fontSize: fontSize.sm,
          color: colors.textMuted,
          textAlign: 'center' as const,
          paddingVertical: spacing.lg,
          lineHeight: 20,
        },
      }),
    [colors]
  );

  // ---- Render Helpers ----

  const renderBabyAge = () => {
    if (babyAgeInfo) {
      return (
        <View style={dynamicStyles.ageBanner}>
          <Ionicons name="happy-outline" size={32} color={colors.primary} />
          <View style={dynamicStyles.ageBannerText}>
            <Text style={dynamicStyles.ageBannerTitle}>
              {profile.babyName
                ? `${profile.babyName} is ${babyAgeInfo.weeks} weeks old`
                : `Baby is ${babyAgeInfo.weeks} weeks old`}
            </Text>
            <Text style={dynamicStyles.ageBannerDays}>
              {babyAgeInfo.days} days since birth
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={dynamicStyles.ageHint}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={colors.textMuted}
        />
        <Text style={dynamicStyles.ageHintText}>
          Set your baby's birth date in settings for personalized insights
        </Text>
      </View>
    );
  };

  const renderTodaySummary = () => (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.cardHeader}>
        <Ionicons name="today-outline" size={22} color={colors.primary} />
        <Text style={dynamicStyles.cardHeaderTitle}>Today's Summary</Text>
      </View>
      <View style={dynamicStyles.summaryRow}>
        {/* Feedings */}
        <View style={dynamicStyles.summaryCard}>
          <Ionicons name="nutrition-outline" size={22} color={colors.feeding} />
          <Text style={dynamicStyles.summaryValue}>
            {todayFeedings.length}
          </Text>
          <Text style={dynamicStyles.summaryLabel}>Feedings</Text>
        </View>

        {/* Diapers */}
        <View style={dynamicStyles.summaryCard}>
          <Ionicons name="water-outline" size={22} color={colors.diapering} />
          <Text style={dynamicStyles.summaryValue}>
            {todayDiapers.length}
          </Text>
          <Text style={dynamicStyles.summaryLabel}>Diapers</Text>
          {todayDiapers.length > 0 && (
            <Text style={dynamicStyles.summarySubLabel}>
              {todayDiaperBreakdown.wet}W / {todayDiaperBreakdown.dirty}D /{' '}
              {todayDiaperBreakdown.both}B
            </Text>
          )}
        </View>

        {/* Sleep */}
        <View style={dynamicStyles.summaryCard}>
          <Ionicons name="moon-outline" size={22} color={colors.sleeping} />
          <Text style={dynamicStyles.summaryValue}>
            {todaySleepHours.toFixed(1)}
          </Text>
          <Text style={dynamicStyles.summaryLabel}>Hours Sleep</Text>
        </View>

        {/* Mood */}
        <View style={dynamicStyles.summaryCard}>
          <Text style={{ fontSize: 22 }}>
            {latestMood ? moodEmoji(latestMood.mood) : '—'}
          </Text>
          <Text style={dynamicStyles.summaryValue}>
            {latestMood ? `${latestMood.mood}/5` : '—'}
          </Text>
          <Text style={dynamicStyles.summaryLabel}>Mood</Text>
        </View>
      </View>
    </View>
  );

  const renderFeedingTrend = () => {
    const hasData = feedingTrend.some((d) => d.count > 0);
    const MAX_BAR_HEIGHT = 120;

    return (
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <Ionicons
            name="nutrition-outline"
            size={22}
            color={colors.feeding}
          />
          <Text style={dynamicStyles.cardHeaderTitle}>
            7-Day Feeding Trend
          </Text>
        </View>

        {!hasData ? (
          <Text style={dynamicStyles.emptyText}>
            No feeding data yet. Start logging feedings in the Tracker to see
            trends here.
          </Text>
        ) : (
          <View style={dynamicStyles.chartContainer}>
            {feedingTrend.map((item, idx) => {
              const barHeight =
                feedingMax > 0
                  ? (item.count / feedingMax) * MAX_BAR_HEIGHT
                  : 0;
              return (
                <View key={idx} style={dynamicStyles.barWrapper}>
                  <Text style={dynamicStyles.barCount}>
                    {item.count > 0 ? item.count : ''}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: Math.max(barHeight, item.count > 0 ? 4 : 0),
                      backgroundColor:
                        item.count > 0 ? colors.feeding : colors.borderLight,
                      borderRadius: 4,
                      minHeight: item.count > 0 ? 4 : 2,
                    }}
                  />
                  <Text style={dynamicStyles.barDayLabel}>
                    {format(item.day, 'EEE')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderSleepTrend = () => {
    const hasData = sleepTrend.some((d) => d.hours > 0);
    const MAX_BAR_HEIGHT = 120;

    return (
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <Ionicons name="moon-outline" size={22} color={colors.sleeping} />
          <Text style={dynamicStyles.cardHeaderTitle}>7-Day Sleep Trend</Text>
        </View>

        {!hasData ? (
          <Text style={dynamicStyles.emptyText}>
            No sleep data yet. Start logging sleep sessions in the Tracker to
            see trends here.
          </Text>
        ) : (
          <>
            {/* Legend */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginBottom: spacing.xs,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                    marginRight: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textMuted,
                  }}
                >
                  7h+
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.warning,
                    marginRight: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textMuted,
                  }}
                >
                  4-7h
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.error,
                    marginRight: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textMuted,
                  }}
                >
                  &lt;4h
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.chartContainer}>
              {sleepTrend.map((item, idx) => {
                const barHeight =
                  sleepMax > 0
                    ? (item.hours / sleepMax) * MAX_BAR_HEIGHT
                    : 0;
                return (
                  <View key={idx} style={dynamicStyles.barWrapper}>
                    <Text style={dynamicStyles.barCount}>
                      {item.hours > 0 ? item.hours.toFixed(1) : ''}
                    </Text>
                    <View
                      style={{
                        width: 20,
                        height: Math.max(
                          barHeight,
                          item.hours > 0 ? 4 : 0
                        ),
                        backgroundColor:
                          item.hours > 0
                            ? sleepBarColor(item.hours)
                            : colors.borderLight,
                        borderRadius: 4,
                        minHeight: item.hours > 0 ? 4 : 2,
                      }}
                    />
                    <Text style={dynamicStyles.barDayLabel}>
                      {format(item.day, 'EEE')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderMoodTrend = () => {
    const hasData = moodTrend.some((d) => d.mood !== null);

    return (
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <Ionicons name="happy-outline" size={22} color={colors.accent} />
          <Text style={dynamicStyles.cardHeaderTitle}>
            Mood Trend (Last 7 Days)
          </Text>
        </View>

        {!hasData ? (
          <Text style={dynamicStyles.emptyText}>
            No mood entries yet. Log your daily mood to see trends here.
          </Text>
        ) : (
          <View style={dynamicStyles.moodRow}>
            {moodTrend.map((item, idx) => {
              if (item.mood !== null) {
                const colorKey = moodColorKey(
                  item.mood
                ) as keyof typeof colors;
                return (
                  <View key={idx} style={dynamicStyles.moodDotWrapper}>
                    <View
                      style={[
                        dynamicStyles.moodDot,
                        { backgroundColor: colors[colorKey] as string },
                      ]}
                    >
                      <Text style={dynamicStyles.moodDotValue}>
                        {item.mood}
                      </Text>
                    </View>
                    <Text style={dynamicStyles.moodDotLabel}>
                      {format(item.day, 'EEE')}
                    </Text>
                  </View>
                );
              }
              return (
                <View key={idx} style={dynamicStyles.moodDotWrapper}>
                  <View style={dynamicStyles.moodDotEmpty} />
                  <Text style={dynamicStyles.moodDotLabel}>
                    {format(item.day, 'EEE')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderDiaperBreakdown = () => {
    const total = todayDiapers.length;

    return (
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <Ionicons name="water-outline" size={22} color={colors.diapering} />
          <Text style={dynamicStyles.cardHeaderTitle}>
            Diaper Breakdown (Today)
          </Text>
        </View>

        {total === 0 ? (
          <Text style={dynamicStyles.emptyText}>
            No diapers logged today yet.
          </Text>
        ) : (
          <View style={dynamicStyles.diaperRow}>
            <View style={dynamicStyles.diaperItem}>
              <View
                style={[
                  dynamicStyles.diaperDot,
                  { backgroundColor: colors.info },
                ]}
              />
              <Text style={dynamicStyles.diaperValue}>
                {todayDiaperBreakdown.wet}
              </Text>
              <Text style={dynamicStyles.diaperLabel}>Wet</Text>
            </View>
            <View style={dynamicStyles.diaperItem}>
              <View
                style={[
                  dynamicStyles.diaperDot,
                  { backgroundColor: colors.accent },
                ]}
              />
              <Text style={dynamicStyles.diaperValue}>
                {todayDiaperBreakdown.dirty}
              </Text>
              <Text style={dynamicStyles.diaperLabel}>Dirty</Text>
            </View>
            <View style={dynamicStyles.diaperItem}>
              <View
                style={[
                  dynamicStyles.diaperDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={dynamicStyles.diaperValue}>
                {todayDiaperBreakdown.both}
              </Text>
              <Text style={dynamicStyles.diaperLabel}>Both</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMilestonesProgress = () => (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.cardHeader}>
        <Ionicons name="trophy-outline" size={22} color={colors.accent} />
        <Text style={dynamicStyles.cardHeaderTitle}>Milestones Progress</Text>
      </View>

      {milestonesTotal === 0 ? (
        <Text style={dynamicStyles.emptyText}>
          No milestones configured yet. Visit the Tracker to set up milestones.
        </Text>
      ) : (
        <>
          <Text style={dynamicStyles.milestoneText}>
            {milestonesAchieved} of {milestonesTotal} milestones achieved
          </Text>
          <View style={dynamicStyles.progressBarTrack}>
            <View
              style={[
                dynamicStyles.progressBarFill,
                { width: `${milestonePercent}%` },
              ]}
            />
          </View>
          <Text style={dynamicStyles.milestonePercent}>
            {milestonePercent}% complete
          </Text>
        </>
      )}
    </View>
  );

  // ---- Main Render ----
  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Insights & Trends</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          A snapshot of your baby's day and weekly patterns
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {renderBabyAge()}
        {renderTodaySummary()}
        {renderFeedingTrend()}
        {renderSleepTrend()}
        {renderMoodTrend()}
        {renderDiaperBreakdown()}
        {renderMilestonesProgress()}
      </ScrollView>
    </SafeAreaView>
  );
}
