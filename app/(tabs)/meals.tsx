import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { postpartumRecipes, weeklyMealPlan } from '../../src/data/recipes';
import { groceryStores } from '../../src/data/grocery-stores';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getRecipeTitle(recipeId: string): string {
  const recipe = postpartumRecipes.find((r) => r.id === recipeId);
  return recipe?.title ?? recipeId;
}

export default function MealsScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const router = useRouter();
  const [mealPlanExpanded, setMealPlanExpanded] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}` as any);
  };

  const handleStorePress = (url: string) => {
    Linking.openURL(url);
  };

  const toggleDay = (dayIndex: number) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
  };

  const renderMealPlanSection = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.mealPlanHeader}
        onPress={() => setMealPlanExpanded(!mealPlanExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Weekly Meal Plan</Text>
        </View>
        <Ionicons
          name={mealPlanExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {mealPlanExpanded && (
        <View style={styles.mealPlanContent}>
          {weeklyMealPlan.days.map((day, dayIndex) => {
            const dayName = day.day ?? DAY_NAMES[dayIndex] ?? `Day ${dayIndex + 1}`;
            const isDayExpanded = expandedDay === dayIndex;

            return (
              <View key={dayIndex} style={styles.dayContainer}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDay(dayIndex)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayName}>{dayName}</Text>
                  <Ionicons
                    name={isDayExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {isDayExpanded && (
                  <View style={styles.dayMeals}>
                    {day.breakfast && (
                      <View style={styles.mealRow}>
                        <Text style={styles.mealType}>Breakfast</Text>
                        <Text style={styles.mealName}>{getRecipeTitle(day.breakfast)}</Text>
                      </View>
                    )}
                    {day.lunch && (
                      <View style={styles.mealRow}>
                        <Text style={styles.mealType}>Lunch</Text>
                        <Text style={styles.mealName}>{getRecipeTitle(day.lunch)}</Text>
                      </View>
                    )}
                    {day.dinner && (
                      <View style={styles.mealRow}>
                        <Text style={styles.mealType}>Dinner</Text>
                        <Text style={styles.mealName}>{getRecipeTitle(day.dinner)}</Text>
                      </View>
                    )}
                    {day.snacks.map((snackId, si) => (
                      <View key={`snack-${si}`} style={styles.mealRow}>
                        <Text style={styles.mealType}>Snack</Text>
                        <Text style={styles.mealName}>{getRecipeTitle(snackId)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderRecipeCard = ({ item }: { item: any }) => {
    const description = item.description
      ? item.description.length > 100
        ? item.description.substring(0, 100) + '...'
        : item.description
      : '';

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.recipeCardContent}>
          <Text style={styles.recipeTitle}>{item.title ?? item.name ?? ''}</Text>
          {description ? (
            <Text style={styles.recipeDescription}>{description}</Text>
          ) : null}

          <View style={styles.recipeMetaRow}>
            {(item.prepTime != null || item.prep_time != null) && (
              <View style={styles.recipeMeta}>
                <Ionicons name="timer-outline" size={14} color={colors.textMuted} />
                <Text style={styles.recipeMetaText}>
                  Prep: {item.prepTime ?? item.prep_time}min
                </Text>
              </View>
            )}
            {(item.cookTime != null || item.cook_time != null) && (
              <View style={styles.recipeMeta}>
                <Ionicons name="flame-outline" size={14} color={colors.textMuted} />
                <Text style={styles.recipeMetaText}>
                  Cook: {item.cookTime ?? item.cook_time}min
                </Text>
              </View>
            )}
            {item.servings != null && (
              <View style={styles.recipeMeta}>
                <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                <Text style={styles.recipeMetaText}>{item.servings} servings</Text>
              </View>
            )}
          </View>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {item.benefits && item.benefits.length > 0 && (
            <View style={styles.benefitsContainer}>
              <Ionicons name="heart-outline" size={14} color={colors.primary} />
              <Text style={styles.benefitsText} numberOfLines={2}>
                {Array.isArray(item.benefits) ? item.benefits.join(', ') : item.benefits}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroceryStoreCard = (store: typeof groceryStores[number]) => {
    const brandColor = store.color;

    return (
      <View key={store.id} style={[styles.storeCard, { borderTopColor: brandColor }]}>
        <Text style={styles.storeName}>{store.name}</Text>

        <View style={styles.storeBadges}>
          {store.deliveryAvailable && (
            <View style={[styles.storeBadge, { backgroundColor: brandColor + '20' }]}>
              <Ionicons name="bicycle-outline" size={12} color={brandColor} />
              <Text style={[styles.storeBadgeText, { color: brandColor }]}>Delivery</Text>
            </View>
          )}
          {store.pickupAvailable && (
            <View style={[styles.storeBadge, { backgroundColor: brandColor + '20' }]}>
              <Ionicons name="storefront-outline" size={12} color={brandColor} />
              <Text style={[styles.storeBadgeText, { color: brandColor }]}>Pickup</Text>
            </View>
          )}
        </View>

        {store.onlineOrderUrl && (
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: brandColor }]}
            onPress={() => handleStorePress(store.onlineOrderUrl)}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.shopButtonText}>Shop Online</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Planning</Text>
          <Text style={styles.headerSubtitle}>
            Nourishing recipes for your postpartum recovery
          </Text>
        </View>

        {/* Weekly Meal Plan (Collapsible) */}
        {renderMealPlanSection()}

        {/* Recipes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="nutrition-outline" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recipes</Text>
          </View>

          <FlatList
            data={postpartumRecipes}
            keyExtractor={(item: any) => item.id?.toString() ?? item.title ?? Math.random().toString()}
            renderItem={renderRecipeCard}
            scrollEnabled={false}
            contentContainerStyle={styles.recipesListContent}
          />
        </View>

        {/* Grocery Stores Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="storefront-outline" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Grocery Stores</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesScrollContent}
          >
            {groceryStores.map((store) => renderGroceryStoreCard(store))}
          </ScrollView>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold as any,
    color: colors.text,
  },
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  mealPlanContent: {
    marginTop: spacing.sm,
  },
  dayContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  dayName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    color: colors.text,
  },
  dayMeals: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  mealType: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold as any,
    color: colors.primary,
    width: 70,
    textTransform: 'uppercase',
  },
  mealName: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  recipesListContent: {
    gap: spacing.md,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  recipeCardContent: {
    padding: spacing.md,
  },
  recipeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recipeDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tagPill: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium as any,
  },
  benefitsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  benefitsText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    flex: 1,
    fontStyle: 'italic',
  },
  storesScrollContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  storeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: 200,
    borderTopWidth: 3,
    ...shadows.sm,
  },
  storeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  storeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  storeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium as any,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  shopButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold as any,
    color: '#FFFFFF',
  },
  });
}
