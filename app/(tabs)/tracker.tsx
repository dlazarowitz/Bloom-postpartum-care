import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { useAppStore } from '../../src/store/useAppStore';
import { babyMilestones } from '../../src/data/milestones';

type TabName = 'feeding' | 'diaper' | 'sleep' | 'milestones';

const TABS: { key: TabName; label: string; icon: string }[] = [
  { key: 'feeding', label: 'Feeding', icon: 'nutrition-outline' },
  { key: 'diaper', label: 'Diaper', icon: 'water-outline' },
  { key: 'sleep', label: 'Sleep', icon: 'moon-outline' },
  { key: 'milestones', label: 'Milestones', icon: 'star-outline' },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(startTime: string, endTime?: string): string {
  if (!endTime) return 'In progress...';
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function getAgeRangeLabel(weeks: [number, number]): string {
  if (weeks[1] <= 4) return '0-4 Weeks';
  if (weeks[1] <= 8) return '4-8 Weeks';
  if (weeks[1] <= 12) return '8-12 Weeks';
  if (weeks[1] <= 16) return '12-16 Weeks';
  return '16-24 Weeks';
}

export default function TrackerScreen() {
  const { colors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabName>('feeding');
  const [activeSleepId, setActiveSleepId] = useState<string | null>(null);
  const router = useRouter();

  const styles = makeStyles(colors);

  const {
    feedingEntries,
    diaperEntries,
    sleepEntries,
    milestones,
    addFeedingEntry,
    addDiaperEntry,
    addSleepEntry,
    updateSleepEntry,
    toggleMilestone,
    setMilestones,
  } = useAppStore();

  // Initialize milestones from data file on mount
  useEffect(() => {
    if (milestones.length === 0) {
      setMilestones(babyMilestones);
    }
  }, []);

  // Check for any active sleep entry on mount
  useEffect(() => {
    const activeSleep = sleepEntries.find((entry) => !entry.endTime);
    if (activeSleep) {
      setActiveSleepId(activeSleep.id);
    }
  }, []);

  const today = getToday();

  // Today's entries
  const todayFeedingEntries = useMemo(
    () => feedingEntries.filter((entry) => entry.startTime.startsWith(today)),
    [feedingEntries, today]
  );

  const todayDiaperEntries = useMemo(
    () => diaperEntries.filter((entry) => entry.time.startsWith(today)),
    [diaperEntries, today]
  );

  const todaySleepEntries = useMemo(
    () => sleepEntries.filter((entry) => entry.startTime.startsWith(today)),
    [sleepEntries, today]
  );

  // Totals
  const feedingTotal = todayFeedingEntries.length;

  const diaperWetCount = todayDiaperEntries.filter(
    (entry) => entry.type === 'wet' || entry.type === 'both'
  ).length;

  const diaperDirtyCount = todayDiaperEntries.filter(
    (entry) => entry.type === 'dirty' || entry.type === 'both'
  ).length;

  const totalSleepHours = useMemo(() => {
    return todaySleepEntries.reduce((total, entry) => {
      if (!entry.endTime) return total;
      const start = new Date(entry.startTime).getTime();
      const end = new Date(entry.endTime).getTime();
      return total + (end - start) / (1000 * 60 * 60);
    }, 0);
  }, [todaySleepEntries]);

  // Grouped milestones
  const groupedMilestones = useMemo(() => {
    const groups: Record<string, typeof milestones> = {};
    milestones.forEach((milestone) => {
      const label = getAgeRangeLabel(milestone.ageRangeWeeks);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(milestone);
    });
    return groups;
  }, [milestones]);

  // Handlers
  const handleAddFeeding = (type: 'breast_left' | 'breast_right' | 'bottle' | 'formula') => {
    addFeedingEntry({
      type,
      startTime: new Date().toISOString(),
    });
    Alert.alert('Logged', `${type.replace('_', ' ')} feeding logged at ${formatTime(new Date().toISOString())}`);
  };

  const handleAddDiaper = (type: 'wet' | 'dirty' | 'both') => {
    addDiaperEntry({
      type,
      time: new Date().toISOString(),
    });
    Alert.alert('Logged', `${type.charAt(0).toUpperCase() + type.slice(1)} diaper logged at ${formatTime(new Date().toISOString())}`);
  };

  const handleToggleSleep = () => {
    if (activeSleepId) {
      // End the current sleep session
      updateSleepEntry(activeSleepId, { endTime: new Date().toISOString() });
      setActiveSleepId(null);
      Alert.alert('Sleep Ended', 'Sleep session has been recorded.');
    } else {
      // Start a new sleep session
      const now = new Date().toISOString();
      addSleepEntry({
        startTime: now,
      });
      // Find the newly added entry (it's the first one since entries are prepended)
      const newEntry = useAppStore.getState().sleepEntries.find(
        (entry) => entry.startTime === now && !entry.endTime
      );
      if (newEntry) {
        setActiveSleepId(newEntry.id);
      }
      Alert.alert('Sleep Started', 'Tracking sleep. Tap "End Sleep" when baby wakes up.');
    }
  };

  const handleToggleMilestone = (id: string) => {
    toggleMilestone(id);
  };

  // Render tab content
  const renderFeedingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Quick Log</Text>
      <View style={styles.quickLogGrid}>
        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: colors.primaryBg }]}
          onPress={() => handleAddFeeding('breast_left')}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipse-outline" size={28} color={colors.primary} />
          <Text style={styles.quickLogLabel}>Left Breast</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: colors.primaryBg }]}
          onPress={() => handleAddFeeding('breast_right')}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipse" size={28} color={colors.primary} />
          <Text style={styles.quickLogLabel}>Right Breast</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: colors.secondaryBg }]}
          onPress={() => handleAddFeeding('bottle')}
          activeOpacity={0.7}
        >
          <Ionicons name="flask-outline" size={28} color={colors.secondary} />
          <Text style={styles.quickLogLabel}>Bottle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: colors.accentLight }]}
          onPress={() => handleAddFeeding('formula')}
          activeOpacity={0.7}
        >
          <Ionicons name="beaker-outline" size={28} color={colors.accent} />
          <Text style={styles.quickLogLabel}>Formula</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Ionicons name="today-outline" size={20} color={colors.primary} />
        <Text style={styles.summaryText}>Today's Total: </Text>
        <Text style={styles.summaryValue}>{feedingTotal} feedings</Text>
      </View>

      <Text style={styles.sectionTitle}>Today's Log</Text>
      {todayFeedingEntries.length === 0 ? (
        <Text style={styles.emptyText}>No feedings logged today. Tap a button above to start tracking.</Text>
      ) : (
        todayFeedingEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryIcon}>
              <Ionicons
                name={
                  entry.type === 'breast_left' || entry.type === 'breast_right'
                    ? 'ellipse-outline'
                    : entry.type === 'bottle'
                    ? 'flask-outline'
                    : 'beaker-outline'
                }
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.entryDetails}>
              <Text style={styles.entryTitle}>
                {entry.type === 'breast_left'
                  ? 'Left Breast'
                  : entry.type === 'breast_right'
                  ? 'Right Breast'
                  : entry.type === 'bottle'
                  ? 'Bottle'
                  : 'Formula'}
              </Text>
              <Text style={styles.entryTime}>{formatTime(entry.startTime)}</Text>
            </View>
            {entry.amount && (
              <Text style={styles.entryAmount}>
                {entry.amount} {entry.unit || 'oz'}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderDiaperTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Quick Log</Text>
      <View style={styles.quickLogGrid}>
        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: colors.secondaryBg }]}
          onPress={() => handleAddDiaper('wet')}
          activeOpacity={0.7}
        >
          <Ionicons name="water-outline" size={28} color={colors.info} />
          <Text style={styles.quickLogLabel}>Wet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: '#FFF5E6' }]}
          onPress={() => handleAddDiaper('dirty')}
          activeOpacity={0.7}
        >
          <Ionicons name="leaf-outline" size={28} color={colors.accent} />
          <Text style={styles.quickLogLabel}>Dirty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickLogButton, { backgroundColor: colors.primaryBg }]}
          onPress={() => handleAddDiaper('both')}
          activeOpacity={0.7}
        >
          <Ionicons name="layers-outline" size={28} color={colors.primary} />
          <Text style={styles.quickLogLabel}>Both</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summaryCardHalf]}>
          <Ionicons name="water" size={18} color={colors.info} />
          <Text style={styles.summaryText}>Wet: </Text>
          <Text style={styles.summaryValue}>{diaperWetCount}</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardHalf]}>
          <Ionicons name="leaf" size={18} color={colors.accent} />
          <Text style={styles.summaryText}>Dirty: </Text>
          <Text style={styles.summaryValue}>{diaperDirtyCount}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's Log</Text>
      {todayDiaperEntries.length === 0 ? (
        <Text style={styles.emptyText}>No diapers logged today. Tap a button above to start tracking.</Text>
      ) : (
        todayDiaperEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryIcon}>
              <Ionicons
                name={
                  entry.type === 'wet'
                    ? 'water-outline'
                    : entry.type === 'dirty'
                    ? 'leaf-outline'
                    : 'layers-outline'
                }
                size={20}
                color={
                  entry.type === 'wet'
                    ? colors.info
                    : entry.type === 'dirty'
                    ? colors.accent
                    : colors.primary
                }
              />
            </View>
            <View style={styles.entryDetails}>
              <Text style={styles.entryTitle}>
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              </Text>
              <Text style={styles.entryTime}>{formatTime(entry.time)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderSleepTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={[
          styles.sleepToggleButton,
          activeSleepId ? styles.sleepToggleActive : styles.sleepToggleInactive,
        ]}
        onPress={handleToggleSleep}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeSleepId ? 'stop-circle-outline' : 'play-circle-outline'}
          size={32}
          color={activeSleepId ? colors.error : colors.sleeping}
        />
        <Text
          style={[
            styles.sleepToggleText,
            { color: activeSleepId ? colors.error : colors.sleeping },
          ]}
        >
          {activeSleepId ? 'End Sleep' : 'Start Sleep'}
        </Text>
        {activeSleepId && (
          <Text style={styles.sleepActiveHint}>Baby is currently sleeping...</Text>
        )}
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <Ionicons name="moon" size={20} color={colors.sleeping} />
        <Text style={styles.summaryText}>Total Sleep Today: </Text>
        <Text style={styles.summaryValue}>{totalSleepHours.toFixed(1)} hours</Text>
      </View>

      <Text style={styles.sectionTitle}>Today's Sleep Log</Text>
      {todaySleepEntries.length === 0 ? (
        <Text style={styles.emptyText}>No sleep logged today. Tap "Start Sleep" when baby falls asleep.</Text>
      ) : (
        todaySleepEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryIcon}>
              <Ionicons
                name={entry.endTime ? 'moon' : 'moon-outline'}
                size={20}
                color={colors.sleeping}
              />
            </View>
            <View style={styles.entryDetails}>
              <Text style={styles.entryTitle}>
                {formatTime(entry.startTime)}
                {entry.endTime ? ` - ${formatTime(entry.endTime)}` : ' - Now'}
              </Text>
              <Text style={styles.entryTime}>
                Duration: {formatDuration(entry.startTime, entry.endTime)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderMilestonesTab = () => {
    const ageGroups = Object.keys(groupedMilestones);

    return (
      <View style={styles.tabContent}>
        {ageGroups.map((ageGroup) => {
          const groupItems = groupedMilestones[ageGroup];
          const achievedCount = groupItems.filter((m) => m.achieved).length;
          const totalCount = groupItems.length;
          const progressPercent = totalCount > 0 ? (achievedCount / totalCount) * 100 : 0;

          return (
            <View key={ageGroup} style={styles.milestoneGroup}>
              <View style={styles.milestoneGroupHeader}>
                <Text style={styles.milestoneGroupTitle}>{ageGroup}</Text>
                <Text style={styles.milestoneGroupProgress}>
                  {achievedCount}/{totalCount} completed
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
              </View>

              {groupItems.map((milestone) => (
                <TouchableOpacity
                  key={milestone.id}
                  style={styles.milestoneItem}
                  onPress={() => handleToggleMilestone(milestone.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.milestoneCheckbox}>
                    <Ionicons
                      name={milestone.achieved ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={milestone.achieved ? colors.success : colors.border}
                    />
                  </View>
                  <View style={styles.milestoneDetails}>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        milestone.achieved && styles.milestoneTitleAchieved,
                      ]}
                    >
                      {milestone.title}
                    </Text>
                    <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                    <Text style={styles.milestoneAge}>
                      {milestone.ageRangeWeeks[0]}-{milestone.ageRangeWeeks[1]} weeks
                    </Text>
                    {milestone.achieved && milestone.achievedDate && (
                      <Text style={styles.milestoneAchievedDate}>
                        Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'feeding':
        return renderFeedingTab();
      case 'diaper':
        return renderDiaperTab();
      case 'sleep':
        return renderSleepTab();
      case 'milestones':
        return renderMilestonesTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Baby Tracker</Text>
        <Text style={styles.headerSubtitle}>Track feedings, diapers, sleep & milestones</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                selectedTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: fontWeight.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  quickLogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickLogButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  quickLogLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.xs,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCardHalf: {
    flex: 1,
  },
  summaryText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    lineHeight: 22,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  entryDetails: {
    flex: 1,
  },
  entryTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  entryTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  sleepToggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    ...shadows.md,
  },
  sleepToggleActive: {
    backgroundColor: '#FFF5F5',
    borderColor: colors.error,
  },
  sleepToggleInactive: {
    backgroundColor: '#F0EEFF',
    borderColor: colors.sleeping,
  },
  sleepToggleText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  sleepActiveHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  milestoneGroup: {
    marginBottom: spacing.lg,
  },
  milestoneGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneGroupTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  milestoneGroupProgress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  milestoneItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  milestoneCheckbox: {
    marginRight: spacing.sm,
    paddingTop: 2,
  },
  milestoneDetails: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  milestoneTitleAchieved: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  milestoneDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  milestoneAge: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  milestoneAchievedDate: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  });
}
