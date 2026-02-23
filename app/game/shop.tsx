import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ITEMS, GAME_COLORS } from '../../src/game/data';
import { ItemDef } from '../../src/game/types';

interface ShopProps {
  gold: number;
  ownedItems: string[];
  onBuy: (itemId: string) => void;
  onClose: () => void;
}

const CATEGORY_ORDER = ['weapon', 'armor', 'boots', 'magic', 'consumable'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Weapons', armor: 'Armor', boots: 'Boots', magic: 'Magic', consumable: 'Consumables',
};

export default function ShopOverlay({ gold, ownedItems, onBuy, onClose }: ShopProps) {
  const itemsByCategory: Record<string, ItemDef[]> = {};
  for (const item of ITEMS) {
    if (!itemsByCategory[item.category]) itemsByCategory[item.category] = [];
    itemsByCategory[item.category].push(item);
  }

  const canBuy = (item: ItemDef) => gold >= item.cost && ownedItems.length < 6;
  const tierColor = (tier: number) => tier === 3 ? '#ffaa00' : tier === 2 ? '#6699ff' : '#88aa88';

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Item Shop</Text>
          <Text style={styles.goldText}>💰 {gold}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.slotsText}>
          Items: {ownedItems.length}/6
        </Text>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {CATEGORY_ORDER.map((cat) => {
            const items = itemsByCategory[cat];
            if (!items) return null;
            return (
              <View key={cat} style={styles.categorySection}>
                <Text style={styles.categoryLabel}>{CATEGORY_LABELS[cat]}</Text>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemRow, !canBuy(item) && styles.itemRowDisabled]}
                    onPress={() => canBuy(item) && onBuy(item.id)}
                    disabled={!canBuy(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.itemIcon}>{item.icon}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: tierColor(item.tier) }]}>{item.name}</Text>
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    </View>
                    <Text style={[styles.itemCost, gold < item.cost && styles.itemCostInsufficient]}>
                      💰{item.cost}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  panel: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: GAME_COLORS.ui.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GAME_COLORS.ui.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: GAME_COLORS.ui.border,
  },
  title: { color: GAME_COLORS.ui.text, fontSize: 18, fontWeight: '700' },
  goldText: { color: GAME_COLORS.gold, fontSize: 16, fontWeight: '700' },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  slotsText: { color: GAME_COLORS.ui.textDim, fontSize: 12, paddingHorizontal: 12, paddingTop: 6 },
  scrollArea: { padding: 12, maxHeight: 400 },
  categorySection: { marginBottom: 12 },
  categoryLabel: { color: GAME_COLORS.ui.textDim, fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  itemRowDisabled: { opacity: 0.4 },
  itemIcon: { fontSize: 22, marginRight: 8, width: 30, textAlign: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemDesc: { color: GAME_COLORS.ui.textDim, fontSize: 10, marginTop: 1 },
  itemCost: { color: GAME_COLORS.gold, fontSize: 13, fontWeight: '700' },
  itemCostInsufficient: { color: '#ff4444' },
});
