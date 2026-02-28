import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../src/utils/theme';
import { epdsQuestions, getScreeningRecommendation, emergencyResources } from '../src/data/mood-screening';
import { useAppStore } from '../src/store/useAppStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type ScreenState = 'intro' | 'screening' | 'results' | 'quick-mood';

const moodEmojis = ['Struggling', 'Tough', 'Okay', 'Good', 'Great'] as const;

export default function MoodCheckScreen() {
  const { colors } = useTheme();
  const addMoodEntry = useAppStore((s) => s.addMoodEntry);

  const moodColors = [colors.mood1, colors.mood2, colors.mood3, colors.mood4, colors.mood5];
  const styles = makeStyles(colors);
  const [screenState, setScreenState] = useState<ScreenState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const handleQuickMood = (mood: 1 | 2 | 3 | 4 | 5) => {
    setSelectedMood(mood);
    addMoodEntry({
      date: new Date().toISOString(),
      mood,
      feelings: [],
      notes: undefined,
    });
  };

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
    if (currentQuestion < epdsQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setScreenState('results');
    }
  };

  const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0);
  const recommendation = getScreeningRecommendation(totalScore);

  const resetScreening = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScreenState('intro');
  };

  // INTRO SCREEN
  if (screenState === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.introHeader}>
            <Ionicons name="heart" size={48} color={colors.primary} />
            <Text style={styles.introTitle}>How Are You Feeling?</Text>
            <Text style={styles.introSubtitle}>
              Your mental health matters just as much as your physical recovery. Check in with yourself regularly.
            </Text>
          </View>

          {/* Quick Mood */}
          <TouchableOpacity
            style={[styles.optionCard, { borderColor: colors.primaryLight }]}
            onPress={() => setScreenState('quick-mood')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="happy" size={28} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Quick Mood Check</Text>
              <Text style={styles.optionDescription}>
                Rate how you're feeling today on a simple scale. Takes 10 seconds.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* EPDS Screening */}
          <TouchableOpacity
            style={[styles.optionCard, { borderColor: colors.secondaryLight }]}
            onPress={() => setScreenState('screening')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.secondaryBg }]}>
              <Ionicons name="clipboard" size={28} color={colors.secondary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>PPD Screening (EPDS)</Text>
              <Text style={styles.optionDescription}>
                A validated 10-question screening tool for postpartum depression. Takes 3-5 minutes.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle" size={18} color={colors.info} />
            <Text style={styles.disclaimerText}>
              These tools are for self-awareness only and are not a substitute for professional diagnosis. Always discuss concerns with your healthcare provider.
            </Text>
          </View>

          {/* Emergency Resources */}
          <Text style={styles.resourcesTitle}>Need Help Now?</Text>
          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={() => Linking.openURL(`tel:${emergencyResources.crisis.phone}`)}
          >
            <Ionicons name="call" size={20} color={colors.error} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyName}>{emergencyResources.crisis.name}</Text>
              <Text style={styles.emergencyPhone}>{emergencyResources.crisis.phone}</Text>
              <Text style={styles.emergencyDesc}>{emergencyResources.crisis.description}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={() => Linking.openURL(`tel:${emergencyResources.postpartum.phone}`)}
          >
            <Ionicons name="heart-circle" size={20} color={colors.primary} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyName}>{emergencyResources.postpartum.name}</Text>
              <Text style={styles.emergencyPhone}>{emergencyResources.postpartum.phone}</Text>
              <Text style={styles.emergencyDesc}>{emergencyResources.postpartum.description}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // QUICK MOOD SCREEN
  if (screenState === 'quick-mood') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.moodTitle}>How are you feeling right now?</Text>
          <Text style={styles.moodSubtitle}>Tap the one that best describes your mood today.</Text>

          <View style={styles.moodGrid}>
            {moodEmojis.map((label, idx) => {
              const mood = (idx + 1) as 1 | 2 | 3 | 4 | 5;
              const isSelected = selectedMood === mood;
              return (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    { borderColor: moodColors[idx] },
                    isSelected && { backgroundColor: moodColors[idx] + '20', borderWidth: 2 },
                  ]}
                  onPress={() => handleQuickMood(mood)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.moodNumber, { color: moodColors[idx] }]}>{mood}</Text>
                  <Text style={[styles.moodLabel, isSelected && { fontWeight: fontWeight.bold }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedMood !== null && (
            <View style={styles.moodConfirmation}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.moodConfirmText}>
                Mood logged! Tracking your mood over time helps identify patterns. Come back tomorrow for another check-in.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => setScreenState('intro')}>
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SCREENING SCREEN
  if (screenState === 'screening') {
    const question = epdsQuestions[currentQuestion];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentQuestion + 1) / epdsQuestions.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {epdsQuestions.length}
          </Text>

          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.answerOption}
                onPress={() => handleAnswer(question.id, option.score)}
                activeOpacity={0.7}
              >
                <Text style={styles.answerText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={resetScreening}>
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={styles.backButtonText}>Start Over</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // RESULTS SCREEN
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Your Results</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{totalScore}</Text>
            <Text style={styles.scoreMax}>/ 30</Text>
          </View>
        </View>

        <View style={[
          styles.recommendationCard,
          { borderLeftColor: totalScore <= 8 ? colors.success : totalScore <= 12 ? colors.warning : colors.error },
        ]}>
          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>

        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle" size={18} color={colors.info} />
          <Text style={styles.disclaimerText}>
            This screening is NOT a diagnosis. A score of 10+ suggests speaking with your healthcare provider for a thorough evaluation.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={resetScreening}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  introHeader: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  introTitle: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.text },
  introSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.lg },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  optionIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: 2 },
  optionDescription: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  disclaimerText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  resourcesTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  emergencyContent: { flex: 1 },
  emergencyName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  emergencyPhone: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary, marginVertical: 2 },
  emergencyDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18 },
  moodTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center', marginTop: spacing.xl },
  moodSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  moodButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  moodNumber: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  moodLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  moodConfirmation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  moodConfirmText: { fontSize: fontSize.md, color: colors.text, flex: 1, lineHeight: 22 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backButtonText: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.medium },
  progressBar: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, marginBottom: spacing.sm },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  progressText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  questionText: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 30 },
  optionsContainer: { gap: spacing.sm },
  answerOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  answerText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  resultsHeader: { alignItems: 'center', paddingVertical: spacing.xl },
  resultsTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  scoreNumber: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.primary },
  scoreMax: { fontSize: fontSize.sm, color: colors.textSecondary },
  recommendationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  recommendationText: { fontSize: fontSize.md, color: colors.text, lineHeight: 24 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textOnPrimary },
  });
}
