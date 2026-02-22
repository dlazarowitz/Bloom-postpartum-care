import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { babyChecklist } from '../../src/data/baby-checklist';
import { useAppStore } from '../../src/store/useAppStore';
import { ChecklistSection, ChecklistItem } from '../../src/types';

type FilterType = 'all' | 'essential' | 'unchecked';

const SECTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  feeding: 'restaurant-outline',
  diapering: 'water-outline',
  sleeping: 'moon-outline',
  clothing: 'shirt-outline',
  bathing: 'water-outline',
  health: 'medkit-outline',
  gear: 'cart-outline',
  nursery: 'bed-outline',
  travel: 'car-outline',
  default: 'list-outline',
};

function getSectionIcon(sectionId: string): keyof typeof Ionicons.glyphMap {
  const normalizedId = sectionId.toLowerCase();
  for (const key of Object.keys(SECTION_ICONS)) {
    if (normalizedId.includes(key)) {
      return SECTION_ICONS[key];
    }
  }
  return SECTION_ICONS.default;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'essential':
      return colors.error;
    case 'recommended':
      return colors.primary;
    case 'nice_to_have':
      return colors.textMuted;
    default:
      return colors.textMuted;
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'essential':
      return 'Essential';
    case 'recommended':
      return 'Recommended';
    case 'nice_to_have':
      return 'Nice to Have';
    default:
      return priority;
  }
}

export default function ChecklistScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { checklist, initializeChecklist, toggleChecklistItem } = useAppStore();

  useEffect(() => {
    if (!checklist || checklist.length === 0) {
      const allItems: ChecklistItem[] = babyChecklist.flatMap(
        (section: ChecklistSection) => section.items
      );
      initializeChecklist(allItems);
    }
  }, []);

  const isItemChecked = (itemId: string): boolean => {
    const storeItem = checklist?.find((item: ChecklistItem) => item.id === itemId);
    return storeItem?.checked ?? false;
  };

  const getFilteredSections = () => {
    return babyChecklist
      .map((section: ChecklistSection) => {
        let filteredItems = section.items;

        if (filter === 'essential') {
          filteredItems = section.items.filter(
            (item: ChecklistItem) => item.priority === 'essential'
          );
        } else if (filter === 'unchecked') {
          filteredItems = section.items.filter(
            (item: ChecklistItem) => !isItemChecked(item.id)
          );
        }

        return {
          title: section.title,
          id: section.id,
          data: filteredItems,
        };
      })
      .filter((section) => section.data.length > 0);
  };

  const totalItems = checklist?.length ?? 0;
  const checkedItems = checklist?.filter((item: ChecklistItem) => item.checked).length ?? 0;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const sections = getFilteredSections();

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; id: string; data: ChecklistItem[] };
  }) => {
    const totalInSection = babyChecklist.find(
      (s: ChecklistSection) => s.id === section.id
    );
    const totalCount = totalInSection?.items.length ?? 0;
    const checkedCount =
      totalInSection?.items.filter((item: ChecklistItem) => isItemChecked(item.id)).length ?? 0;
    const icon = getSectionIcon(section.id);

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <Text style={styles.sectionCount}>
          ({checkedCount}/{totalCount})
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ChecklistItem }) => {
    const checked = isItemChecked(item.id);
    const priorityColor = getPriorityColor(item.priority);
    const priorityLabel = getPriorityLabel(item.priority);

    return (
      <TouchableOpacity
        style={[styles.itemRow, checked && styles.itemRowChecked]}
        onPress={() => toggleChecklistItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <Ionicons
            name={checked ? 'checkbox' : 'square-outline'}
            size={24}
            color={checked ? colors.primary : colors.textMuted}
          />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemTopRow}>
            <Text style={[styles.itemName, checked && styles.itemNameChecked]}>
              {item.name}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {priorityLabel}
              </Text>
            </View>
          </View>
          <View style={styles.itemBottomRow}>
            {item.quantity != null && (
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            )}
            {item.estimatedCost != null && (
              <Text style={styles.itemCost}>${item.estimatedCost.toFixed(2)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Baby Essentials Checklist</Text>
          <Text style={styles.headerSubtitle}>
            Track everything you need for your little one
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.progressDetail}>
            {checkedItems} of {totalItems} items checked
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'essential', 'unchecked'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === f && styles.filterTabTextActive,
                ]}
              >
                {f === 'all' ? 'All' : f === 'essential' ? 'Essential' : 'Unchecked'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section List */}
        <SectionList
          sections={sections}
          keyExtractor={(item: ChecklistItem) => item.id}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {filter === 'unchecked'
                  ? 'All items are checked off!'
                  : 'No items to display.'}
              </Text>
            </View>
          }
        />
      </View>
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
    backgroundColor: colors.background,
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
  progressContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold as any,
    color: colors.text,
  },
  progressPercent: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold as any,
    color: colors.primary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressDetail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as any,
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold as any,
    color: colors.text,
  },
  sectionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium as any,
    color: colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  itemRowChecked: {
    opacity: 0.7,
    backgroundColor: colors.surface,
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium as any,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold as any,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemQuantity: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  itemCost: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold as any,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
