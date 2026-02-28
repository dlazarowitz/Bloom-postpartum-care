import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAppStore } from '../src/store/useAppStore';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../src/utils/theme';
import type { DeliveryType } from '../src/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const updateProfile = useAppStore((s) => s.updateProfile);

  // Step management
  const [step, setStep] = useState(1);

  // Form data
  const [name, setName] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);

  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  // ---- helpers ----

  const animateProgress = (toStep: number) => {
    Animated.timing(progressAnim, {
      toValue: toStep / TOTAL_STEPS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const goNext = () => {
    const next = step + 1;
    setStep(next);
    animateProgress(next);
  };

  const goBack = () => {
    const prev = step - 1;
    if (prev >= 1) {
      setStep(prev);
      animateProgress(prev);
    }
  };

  const handleComplete = () => {
    updateProfile({
      name: name.trim(),
      babyName: babyName.trim() || undefined,
      babyBirthDate: babyBirthDate.trim() || undefined,
      deliveryType: deliveryType ?? undefined,
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  };

  // ---- shared UI pieces ----

  const renderProgressBar = () => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.progressContainer}>
        {/* Back arrow (hidden on step 1) */}
        {step > 1 ? (
          <TouchableOpacity
            onPress={goBack}
            style={styles.progressBackButton}
            activeOpacity={0.6}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.progressBackButton} />
        )}

        {/* Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.borderLight }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: progressWidth, backgroundColor: colors.primary },
            ]}
          />
        </View>

        {/* Step indicator text */}
        <Text style={[styles.progressStepText, { color: colors.textMuted }]}>
          {step}/{TOTAL_STEPS}
        </Text>
      </View>
    );
  };

  const renderDots = () => (
    <View style={styles.dotsRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const active = i + 1 === step;
        const completed = i + 1 < step;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: active
                  ? colors.primary
                  : completed
                    ? colors.primaryLight
                    : colors.borderLight,
              },
              active && styles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );

  const renderPrimaryButton = (
    label: string,
    onPress: () => void,
    disabled = false,
  ) => (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        { backgroundColor: disabled ? colors.borderLight : colors.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text
        style={[
          styles.primaryButtonText,
          { color: disabled ? colors.textMuted : colors.textOnPrimary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // ---- step renderers ----

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeContent}>
        {/* Decorative icon */}
        <View style={[styles.welcomeIconCircle, { backgroundColor: colors.primaryBg }]}>
          <Ionicons name="flower-outline" size={56} color={colors.primary} />
        </View>

        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Welcome to Bloom
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          Your personal companion for the postpartum journey. We are here to
          support you with recovery guidance, baby care tracking, and gentle
          reminders to look after yourself too.
        </Text>
      </View>

      <View style={styles.stepFooter}>
        {renderDots()}
        {renderPrimaryButton('Get Started', goNext)}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <KeyboardAvoidingView
      style={styles.stepContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.stepScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepBody}>
          <View style={[styles.stepIconCircle, { backgroundColor: colors.secondaryBg }]}>
            <Ionicons name="person-outline" size={36} color={colors.secondary} />
          </View>

          <Text style={[styles.stepTitle, { color: colors.text }]}>
            What's your name?
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            We will use this to personalise your experience.
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: name.trim() ? colors.primary : colors.border,
              },
            ]}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
            returnKeyType="next"
          />
        </View>
      </ScrollView>

      <View style={styles.stepFooter}>
        {renderDots()}
        {renderPrimaryButton('Continue', goNext, !name.trim())}
      </View>
    </KeyboardAvoidingView>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      style={styles.stepContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.stepScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepBody}>
          <View style={[styles.stepIconCircle, { backgroundColor: colors.accentLight + '40' }]}>
            <Ionicons name="happy-outline" size={36} color={colors.accent} />
          </View>

          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Tell us about your baby
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            This helps us tailor milestones and recovery timelines. Both fields
            are optional.
          </Text>

          {/* Baby name */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            Baby's Name
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Baby's name (optional)"
            placeholderTextColor={colors.textMuted}
            value={babyName}
            onChangeText={setBabyName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Birth date */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
            Date of Birth
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={colors.textMuted}
            value={babyBirthDate}
            onChangeText={setBabyBirthDate}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            maxLength={10}
          />
        </View>
      </ScrollView>

      <View style={styles.stepFooter}>
        {renderDots()}
        {renderPrimaryButton('Continue', goNext)}
      </View>
    </KeyboardAvoidingView>
  );

  const renderStep4 = () => {
    const deliveryOptions: {
      type: DeliveryType;
      label: string;
      description: string;
      icon: keyof typeof Ionicons.glyphMap;
    }[] = [
      {
        type: 'vaginal',
        label: 'Vaginal Delivery',
        description:
          'We will provide recovery guidance specific to vaginal birth, including pelvic-floor care.',
        icon: 'heart-outline',
      },
      {
        type: 'csection',
        label: 'C-Section',
        description:
          'We will focus on incision care, movement guidance, and surgical recovery milestones.',
        icon: 'medkit-outline',
      },
    ];

    return (
      <View style={styles.stepContainer}>
        <ScrollView
          contentContainerStyle={styles.stepScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepBody}>
            <View style={[styles.stepIconCircle, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="fitness-outline" size={36} color={colors.primary} />
            </View>

            <Text style={[styles.stepTitle, { color: colors.text }]}>
              How did you deliver?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
              This allows us to personalise your recovery plan.
            </Text>

            {/* Delivery cards */}
            <View style={styles.deliveryCards}>
              {deliveryOptions.map((option) => {
                const isSelected = deliveryType === option.type;
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.deliveryCard,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryBg
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                      shadows.sm,
                    ]}
                    onPress={() => setDeliveryType(option.type)}
                    activeOpacity={0.7}
                  >
                    {/* Selected indicator */}
                    <View
                      style={[
                        styles.deliveryCardCheck,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.borderLight,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
                      )}
                    </View>

                    <Ionicons
                      name={option.icon}
                      size={32}
                      color={isSelected ? colors.primary : colors.textMuted}
                      style={styles.deliveryCardIcon}
                    />
                    <Text
                      style={[
                        styles.deliveryCardTitle,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected
                            ? fontWeight.bold
                            : fontWeight.semibold,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.deliveryCardDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.stepFooter}>
          {renderDots()}
          {renderPrimaryButton('Complete Setup', handleComplete, !deliveryType)}
        </View>
      </View>
    );
  };

  // ---- main render ----

  const stepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {renderProgressBar()}
      {stepContent()}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // Progress bar row
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  progressBackButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressStepText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    width: 36,
    textAlign: 'center',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.xs,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },

  // Step layout
  stepContainer: {
    flex: 1,
  },
  stepScrollContent: {
    flexGrow: 1,
  },
  stepBody: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  stepFooter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Welcome step
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  welcomeIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },

  // Generic step header
  stepIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  // Text inputs
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm + 2,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },

  // Primary CTA button
  primaryButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },

  // Delivery cards
  deliveryCards: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  deliveryCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  deliveryCardCheck: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryCardIcon: {
    marginBottom: spacing.sm,
  },
  deliveryCardTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  deliveryCardDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
