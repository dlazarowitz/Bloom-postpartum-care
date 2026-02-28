import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { postpartumRecipes } from '../../src/data/recipes';
import { groceryStores } from '../../src/data/grocery-stores';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function RecipeDetailScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = postpartumRecipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;

  const categoryColors: Record<string, string> = {
    produce: colors.success,
    protein: colors.error,
    dairy: colors.info,
    grains: colors.accent,
    pantry: colors.textSecondary,
    frozen: colors.info,
    other: colors.textMuted,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title & Meta */}
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {/* Time & Servings Bar */}
        <View style={styles.metaBar}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.metaLabel}>Prep</Text>
            <Text style={styles.metaValue}>{recipe.prepTime}m</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={18} color={colors.accent} />
            <Text style={styles.metaLabel}>Cook</Text>
            <Text style={styles.metaValue}>{recipe.cookTime > 0 ? `${recipe.cookTime}m` : 'None'}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="hourglass-outline" size={18} color={colors.secondary} />
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={styles.metaValue}>{totalTime}m</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={18} color={colors.info} />
            <Text style={styles.metaLabel}>Serves</Text>
            <Text style={styles.metaValue}>{recipe.servings}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {recipe.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Postpartum Benefits</Text>
          {recipe.benefits.map((benefit, idx) => (
            <View key={idx} style={styles.benefitRow}>
              <Ionicons name="leaf" size={16} color={colors.secondary} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsCard}>
          {recipe.ingredients.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColors[ing.category] || colors.textMuted }]} />
              <Text style={styles.ingredientAmount}>
                {ing.amount} {ing.unit}
              </Text>
              <Text style={[styles.ingredientName, ing.optional && styles.optionalText]}>
                {ing.name}
                {ing.optional ? ' (optional)' : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.instructionsCard}>
          {recipe.instructions.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Nutrition Highlights */}
        <Text style={styles.sectionTitle}>Nutrition Highlights</Text>
        <View style={styles.nutritionCard}>
          {recipe.nutritionHighlights.map((note, idx) => (
            <View key={idx} style={styles.nutritionRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.nutritionText}>{note}</Text>
            </View>
          ))}
        </View>

        {/* Shop Ingredients */}
        <Text style={styles.sectionTitle}>Shop Ingredients</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeScroll}>
          {groceryStores.slice(0, 5).map((store) => (
            <TouchableOpacity
              key={store.id}
              style={[styles.storeChip, { borderColor: store.color }]}
              onPress={() => Linking.openURL(store.onlineOrderUrl)}
              activeOpacity={0.7}
            >
              <Ionicons name={(store.logo || 'storefront') as IoniconsName} size={16} color={store.color} />
              <Text style={[styles.storeChipText, { color: store.color }]}>{store.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
    notFoundText: { fontSize: fontSize.lg, color: colors.textMuted, marginTop: spacing.md },
    title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
    description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
    metaBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.md,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metaItem: { alignItems: 'center', gap: 2 },
    metaLabel: { fontSize: fontSize.xs, color: colors.textMuted },
    metaValue: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
    metaDivider: { width: 1, height: 32, backgroundColor: colors.borderLight },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
    tag: {
      backgroundColor: colors.primaryLight + '60',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    tagText: { fontSize: fontSize.xs, color: colors.primaryDark, fontWeight: fontWeight.medium },
    benefitsCard: {
      backgroundColor: colors.secondaryBg,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    benefitsTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.secondaryDark, marginBottom: spacing.sm },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    benefitText: { fontSize: fontSize.sm, color: colors.text },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
    ingredientsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.lg,
    },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    categoryDot: { width: 8, height: 8, borderRadius: 4 },
    ingredientAmount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text, minWidth: 70 },
    ingredientName: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
    optionalText: { fontStyle: 'italic' },
    instructionsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.lg,
    },
    stepRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    stepNumberText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textOnPrimary },
    stepText: { fontSize: fontSize.md, color: colors.text, lineHeight: 24, flex: 1 },
    nutritionCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
      marginBottom: spacing.lg,
    },
    nutritionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    nutritionText: { fontSize: fontSize.sm, color: colors.text },
    storeScroll: { marginBottom: spacing.lg },
    storeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1.5,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginRight: spacing.sm,
      backgroundColor: colors.surface,
    },
    storeChipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
    bottomSpacer: { height: spacing.xxl },
  });
}
