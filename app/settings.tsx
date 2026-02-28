import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeMode } from '../src/contexts/ThemeContext';
import { useAppStore } from '../src/store/useAppStore';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../src/utils/theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Light', value: 'light', icon: 'sunny' },
  { label: 'Dark', value: 'dark', icon: 'moon' },
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
];

const APP_VERSION = '1.0.0';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Human-readable label for delivery type stored in the profile. */
function deliveryLabel(type?: string): string {
  if (type === 'vaginal') return 'Vaginal Delivery';
  if (type === 'csection') return 'C-Section';
  return 'Not set';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, mode, setTheme, isDark } = useTheme();
  const profile = useAppStore((s) => s.profile);

  // ---- render helpers ----

  const renderSectionTitle = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );

  const renderCard = (children: React.ReactNode) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadows.sm,
      ]}
    >
      {children}
    </View>
  );

  // ---- main render ----

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        {/* Spacer to keep title centred */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================
            THEME SECTION
           ================================================================ */}
        {renderSectionTitle('Appearance')}
        {renderCard(
          THEME_OPTIONS.map((option, index) => {
            const isSelected = mode === option.value;
            const isLast = index === THEME_OPTIONS.length - 1;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.6}
                onPress={() => setTheme(option.value)}
                style={[
                  styles.optionRow,
                  !isLast && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <View style={styles.optionLeft}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={isSelected ? colors.primary : colors.textMuted}
                    style={styles.optionIcon}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? colors.text : colors.textSecondary,
                        fontWeight: isSelected
                          ? fontWeight.semibold
                          : fontWeight.regular,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>

                {/* Radio indicator */}
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected
                        ? colors.primary
                        : colors.textMuted,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          }),
        )}
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {mode === 'system'
            ? `Following your device setting (currently ${isDark ? 'dark' : 'light'}).`
            : `Theme is set to ${mode} mode.`}
        </Text>

        {/* ================================================================
            PROFILE SECTION
           ================================================================ */}
        {renderSectionTitle('Profile')}
        {renderCard(
          <>
            {/* Name */}
            <View
              style={[
                styles.profileRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.profileRowLeft}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.profileRowIcon}
                />
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Name
                </Text>
              </View>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {profile.name || 'Not set'}
              </Text>
            </View>

            {/* Baby name */}
            <View
              style={[
                styles.profileRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.profileRowLeft}>
                <Ionicons
                  name="happy-outline"
                  size={20}
                  color={colors.secondary}
                  style={styles.profileRowIcon}
                />
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Baby Name
                </Text>
              </View>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {profile.babyName || 'Not set'}
              </Text>
            </View>

            {/* Delivery type */}
            <View style={styles.profileRow}>
              <View style={styles.profileRowLeft}>
                <Ionicons
                  name="medkit-outline"
                  size={20}
                  color={colors.accent}
                  style={styles.profileRowIcon}
                />
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Delivery Type
                </Text>
              </View>
              <Text style={[styles.profileValue, { color: colors.text }]}>
                {deliveryLabel(profile.deliveryType)}
              </Text>
            </View>
          </>,
        )}

        {/* ================================================================
            ABOUT SECTION
           ================================================================ */}
        {renderSectionTitle('About')}
        {renderCard(
          <>
            <View
              style={[
                styles.aboutRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <Text style={[styles.aboutLabel, { color: colors.text }]}>
                Version
              </Text>
              <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>
                Bloom v{APP_VERSION}
              </Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.text }]}>
                Description
              </Text>
              <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>
                Postpartum care companion
              </Text>
            </View>
          </>,
        )}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Made with care for new parents.
        </Text>
      </ScrollView>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  headerSpacer: {
    width: 36,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Section title
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
  },

  // Card container
  card: {
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  // Theme option row
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: spacing.sm + 4,
  },
  optionLabel: {
    fontSize: fontSize.md,
  },

  // Radio button
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  hint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },

  // Profile rows
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  profileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRowIcon: {
    marginRight: spacing.sm + 4,
  },
  profileLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  profileValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    maxWidth: '50%',
    textAlign: 'right',
  },

  // About rows
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  aboutLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  aboutValue: {
    fontSize: fontSize.md,
  },

  // Footer
  footer: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
