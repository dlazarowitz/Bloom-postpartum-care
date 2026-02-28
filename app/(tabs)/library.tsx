import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInWeeks } from 'date-fns';
import { useTheme } from '../../src/contexts/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { useAppStore } from '../../src/store/useAppStore';
import { articles, Article } from '../../src/data/content-library';

type CategoryFilter = 'all' | Article['category'];

interface CategoryOption {
  key: CategoryFilter;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: 'all', label: 'All' },
  { key: 'recovery', label: 'Recovery' },
  { key: 'baby_care', label: 'Baby Care' },
  { key: 'mental_health', label: 'Mental Health' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'self_care', label: 'Self Care' },
  { key: 'relationships', label: 'Relationships' },
];

function getCategoryBadgeColor(
  category: Article['category'],
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (category) {
    case 'recovery':
      return colors.primary;
    case 'baby_care':
      return colors.info;
    case 'mental_health':
      return colors.secondary;
    case 'nutrition':
      return colors.accent;
    case 'relationships':
      return '#8B7EC8';
    case 'self_care':
      return colors.success;
    default:
      return colors.textMuted;
  }
}

function getCategoryLabel(category: Article['category']): string {
  switch (category) {
    case 'recovery':
      return 'Recovery';
    case 'baby_care':
      return 'Baby Care';
    case 'mental_health':
      return 'Mental Health';
    case 'nutrition':
      return 'Nutrition';
    case 'relationships':
      return 'Relationships';
    case 'self_care':
      return 'Self Care';
    default:
      return category;
  }
}

export default function LibraryScreen() {
  const { colors } = useTheme();
  const profile = useAppStore((s) => s.profile);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const weeksPostpartum = useMemo(() => {
    if (!profile.babyBirthDate) return null;
    const birthDate = new Date(profile.babyBirthDate);
    const now = new Date();
    return differenceInWeeks(now, birthDate);
  }, [profile.babyBirthDate]);

  const personalizedArticles = useMemo(() => {
    if (weeksPostpartum === null) return [];
    return articles.filter(
      (a) => weeksPostpartum >= a.weekRange[0] && weeksPostpartum <= a.weekRange[1],
    );
  }, [weeksPostpartum]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  const styles = getStyles(colors);

  const renderCategoryChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScrollView}
      contentContainerStyle={styles.chipContainer}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.chip,
              isActive && styles.chipActive,
              isActive && { backgroundColor: colors.primary },
            ]}
            onPress={() => setSelectedCategory(cat.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                isActive && styles.chipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderArticleCard = (article: Article) => {
    const badgeColor = getCategoryBadgeColor(article.category, colors);
    return (
      <TouchableOpacity
        key={article.id}
        style={styles.articleCard}
        onPress={() => setSelectedArticle(article)}
        activeOpacity={0.7}
      >
        <View style={styles.articleCardHeader}>
          <View style={[styles.articleIconContainer, { backgroundColor: badgeColor + '18' }]}>
            <Ionicons
              name={article.icon as any}
              size={24}
              color={badgeColor}
            />
          </View>
          <View style={styles.articleMeta}>
            <View style={[styles.categoryBadge, { backgroundColor: badgeColor + '1A' }]}>
              <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
                {getCategoryLabel(article.category)}
              </Text>
            </View>
            <View style={styles.readTimeContainer}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={styles.readTimeText}>{article.readTimeMinutes} min read</Text>
            </View>
          </View>
        </View>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleSummary} numberOfLines={2}>
          {article.summary}
        </Text>
        <View style={styles.articleFooter}>
          <Text style={styles.weekRangeText}>
            Weeks {article.weekRange[0]}-{article.weekRange[1]}
          </Text>
          <View style={styles.readMoreContainer}>
            <Text style={[styles.readMoreText, { color: colors.primary }]}>Read</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderForYouSection = () => {
    if (weeksPostpartum === null) {
      return (
        <View style={styles.forYouPrompt}>
          <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
          <Text style={styles.forYouPromptTitle}>Personalized Recommendations</Text>
          <Text style={styles.forYouPromptText}>
            Set your baby's birth date in Settings to get articles tailored to your
            current stage of the postpartum journey.
          </Text>
        </View>
      );
    }

    if (personalizedArticles.length === 0) {
      return (
        <View style={styles.forYouPrompt}>
          <Ionicons name="checkmark-circle-outline" size={28} color={colors.success} />
          <Text style={styles.forYouPromptTitle}>You are doing great!</Text>
          <Text style={styles.forYouPromptText}>
            No specific articles match week {weeksPostpartum} right now. Browse
            the full library below for helpful resources.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.forYouSection}>
        <View style={styles.forYouHeader}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={styles.forYouTitle}>For You</Text>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>
              Week {weeksPostpartum}
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forYouScroll}
        >
          {personalizedArticles.map((article) => {
            const badgeColor = getCategoryBadgeColor(article.category, colors);
            return (
              <TouchableOpacity
                key={article.id}
                style={styles.forYouCard}
                onPress={() => setSelectedArticle(article)}
                activeOpacity={0.7}
              >
                <View style={[styles.forYouIconWrap, { backgroundColor: badgeColor + '18' }]}>
                  <Ionicons name={article.icon as any} size={22} color={badgeColor} />
                </View>
                <Text style={styles.forYouCardTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.forYouCardSummary} numberOfLines={2}>
                  {article.summary}
                </Text>
                <View style={[styles.forYouCategoryBadge, { backgroundColor: badgeColor + '1A' }]}>
                  <Text style={[styles.forYouCategoryText, { color: badgeColor }]}>
                    {getCategoryLabel(article.category)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderArticleDetail = () => {
    if (!selectedArticle) return null;
    const badgeColor = getCategoryBadgeColor(selectedArticle.category, colors);
    const paragraphs = selectedArticle.content.split('\n\n');

    return (
      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => setSelectedArticle(null)}
              style={styles.modalCloseButton}
              hitSlop={12}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <View style={[styles.categoryBadge, { backgroundColor: badgeColor + '1A' }]}>
              <Text style={[styles.categoryBadgeText, { color: badgeColor }]}>
                {getCategoryLabel(selectedArticle.category)}
              </Text>
            </View>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.modalIconContainer, { backgroundColor: badgeColor + '18' }]}>
              <Ionicons name={selectedArticle.icon as any} size={36} color={badgeColor} />
            </View>
            <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
            <View style={styles.modalMetaRow}>
              <View style={styles.readTimeContainer}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.modalMetaText}>
                  {selectedArticle.readTimeMinutes} min read
                </Text>
              </View>
              <Text style={styles.modalMetaText}>
                Weeks {selectedArticle.weekRange[0]}-{selectedArticle.weekRange[1]} postpartum
              </Text>
            </View>
            <View style={styles.modalDivider} />
            {paragraphs.map((paragraph, index) => (
              <Text key={index} style={styles.modalParagraph}>
                {paragraph}
              </Text>
            ))}
            <View style={styles.modalDisclaimer}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.modalDisclaimerText}>
                This article is for educational purposes only and does not replace
                professional medical advice. Always consult your healthcare provider
                with specific questions or concerns.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyStateTitle}>No articles found</Text>
      <Text style={styles.emptyStateText}>
        There are no articles in this category yet. Try selecting a different category.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Hub</Text>
        <Text style={styles.headerSubtitle}>Evidence-based guides for your journey</Text>
      </View>

      {renderCategoryChips()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === 'all' && renderForYouSection()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'All Articles'
              : getCategoryLabel(selectedCategory as Article['category'])}
          </Text>
          <Text style={styles.sectionCount}>
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {filteredArticles.length === 0
          ? renderEmptyState()
          : filteredArticles.map(renderArticleCard)}
      </ScrollView>

      {renderArticleDetail()}
    </SafeAreaView>
  );
}

function getStyles(colors: ReturnType<typeof useTheme>['colors']) {
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

    // Category chips
    chipScrollView: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    chipContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.textOnPrimary,
      fontWeight: fontWeight.semibold,
    },

    // Scroll
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xxl + spacing.xl,
    },

    // For You section
    forYouSection: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    forYouHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    forYouTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.text,
      marginLeft: spacing.sm,
      flex: 1,
    },
    weekBadge: {
      backgroundColor: colors.primaryBg,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    weekBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
      color: colors.primary,
    },
    forYouScroll: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    forYouCard: {
      width: 200,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...shadows.md,
    },
    forYouIconWrap: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    forYouCardTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    forYouCardSummary: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 16,
      marginBottom: spacing.sm,
    },
    forYouCategoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    forYouCategoryText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
    },

    // For You prompt
    forYouPrompt: {
      margin: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      ...shadows.sm,
    },
    forYouPromptTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    forYouPromptText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },

    // Section header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.bold,
      color: colors.text,
    },
    sectionCount: {
      fontSize: fontSize.sm,
      color: colors.textMuted,
      fontWeight: fontWeight.medium,
    },

    // Article card
    articleCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...shadows.sm,
    },
    articleCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    articleIconContainer: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    articleMeta: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
    },
    categoryBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semibold,
    },
    readTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    readTimeText: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    articleTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    articleSummary: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    articleFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    weekRangeText: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
      fontWeight: fontWeight.medium,
    },
    readMoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    readMoreText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
    },

    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    emptyStateTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    emptyStateText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },

    // Modal (article detail)
    modalSafe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalScroll: {
      flex: 1,
    },
    modalScrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl + spacing.xl,
    },
    modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    modalTitle: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    modalMetaText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    modalDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.lg,
    },
    modalParagraph: {
      fontSize: fontSize.md,
      color: colors.text,
      lineHeight: 24,
      marginBottom: spacing.lg,
    },
    modalDisclaimer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surfaceSecondary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    modalDisclaimerText: {
      flex: 1,
      fontSize: fontSize.xs,
      color: colors.textMuted,
      lineHeight: 18,
    },
  });
}
