import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { HEROES, SKINS, HERO_UNLOCK_COST, GAME_COLORS } from '../../src/game/data';
import { getProfile, unlockHero, isHeroUnlocked, buySkin, ownsSkin, equipSkin, getEquippedSkin } from '../../src/game/progression';

export default function CollectionScreen() {
  const router = useRouter();
  const [selectedHeroId, setSelectedHeroId] = useState(HEROES[0].id);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);
  const profile = getProfile();
  const hero = HEROES.find((h) => h.id === selectedHeroId)!;
  const heroSkins = SKINS.filter((s) => s.heroId === selectedHeroId);
  const unlocked = isHeroUnlocked(selectedHeroId);
  const cost = HERO_UNLOCK_COST[selectedHeroId] || 0;
  const equipped = getEquippedSkin(selectedHeroId);

  const handleUnlock = () => {
    if (unlockHero(selectedHeroId, cost)) refresh();
  };

  const handleBuySkin = (skinId: string, price: number) => {
    if (buySkin(skinId, price)) refresh();
  };

  const handleEquip = (skinId: string) => {
    equipSkin(selectedHeroId, equipped === skinId ? null : skinId);
    refresh();
  };

  const rarityColor = (r: string) =>
    r === 'legendary' ? '#ffaa00' : r === 'epic' ? '#aa44ff' : r === 'rare' ? '#4488ff' : '#88aa88';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>COLLECTION</Text>
        <View style={styles.currencyRow}>
          <Text style={styles.goldText}>💰 {profile.gold}</Text>
          <Text style={styles.gemsText}>💎 {profile.gems}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroList}>
        {HEROES.map((h) => {
          const owned = isHeroUnlocked(h.id);
          return (
            <TouchableOpacity
              key={h.id}
              style={[styles.heroThumb, selectedHeroId === h.id && styles.heroThumbSelected, !owned && styles.heroThumbLocked]}
              onPress={() => setSelectedHeroId(h.id)}
            >
              <Text style={styles.heroThumbIcon}>{h.icon}</Text>
              <Text style={styles.heroThumbName}>{h.name}</Text>
              {!owned && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailContent}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroIcon}>{hero.icon}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{hero.name}</Text>
            <Text style={styles.heroTitle}>{hero.title}</Text>
            <Text style={styles.heroDesc}>{hero.description}</Text>
          </View>
        </View>

        {!unlocked && (
          <TouchableOpacity
            style={[styles.unlockBtn, profile.gold < cost && styles.unlockBtnDisabled]}
            onPress={handleUnlock}
            disabled={profile.gold < cost}
          >
            <Text style={styles.unlockBtnText}>Unlock for 💰{cost}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Abilities</Text>
        {hero.abilities.map((a) => (
          <View key={a.id} style={styles.abilityRow}>
            <Text style={styles.abilityIcon}>{a.icon}</Text>
            <View style={styles.abilityInfo}>
              <Text style={styles.abilityName}>{a.name}</Text>
              <Text style={styles.abilityDesc}>{a.description}</Text>
            </View>
          </View>
        ))}

        {heroSkins.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skins</Text>
            {heroSkins.map((skin) => {
              const owned = ownsSkin(skin.id);
              const isEquipped = equipped === skin.id;
              return (
                <View key={skin.id} style={styles.skinRow}>
                  <View style={[styles.skinPreview, { backgroundColor: skin.bodyColor, borderColor: skin.borderColor }]} />
                  <View style={styles.skinInfo}>
                    <Text style={[styles.skinName, { color: rarityColor(skin.rarity) }]}>{skin.name}</Text>
                    <Text style={[styles.skinRarity, { color: rarityColor(skin.rarity) }]}>{skin.rarity.toUpperCase()}</Text>
                  </View>
                  {owned ? (
                    <TouchableOpacity
                      style={[styles.skinBtn, isEquipped && styles.skinBtnEquipped]}
                      onPress={() => handleEquip(skin.id)}
                    >
                      <Text style={styles.skinBtnText}>{isEquipped ? 'Equipped' : 'Equip'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.skinBtn, profile.gems < skin.price && styles.skinBtnDisabled]}
                      onPress={() => handleBuySkin(skin.id, skin.price)}
                      disabled={profile.gems < skin.price}
                    >
                      <Text style={styles.skinBtnText}>💎{skin.price}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GAME_COLORS.ui.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  backText: { color: '#88aacc', fontSize: 16 },
  title: { color: GAME_COLORS.ui.text, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
  currencyRow: { flexDirection: 'row', gap: 12 },
  goldText: { color: GAME_COLORS.gold, fontSize: 14, fontWeight: '600' },
  gemsText: { color: '#aa88ff', fontSize: 14, fontWeight: '600' },
  heroList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  heroThumb: { width: 70, height: 80, backgroundColor: GAME_COLORS.ui.panel, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: GAME_COLORS.ui.border },
  heroThumbSelected: { borderColor: '#4488ff', borderWidth: 2 },
  heroThumbLocked: { opacity: 0.5 },
  heroThumbIcon: { fontSize: 24 },
  heroThumbName: { color: GAME_COLORS.ui.text, fontSize: 9, marginTop: 4, fontWeight: '600' },
  lockIcon: { position: 'absolute', top: 4, right: 4, fontSize: 10 },
  detailScroll: { flex: 1 },
  detailContent: { padding: 16 },
  heroHeader: { flexDirection: 'row', marginBottom: 16 },
  heroIcon: { fontSize: 48, marginRight: 16 },
  heroInfo: { flex: 1 },
  heroName: { color: GAME_COLORS.ui.text, fontSize: 22, fontWeight: '700' },
  heroTitle: { color: '#88aacc', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroDesc: { color: GAME_COLORS.ui.textDim, fontSize: 13 },
  unlockBtn: { backgroundColor: '#2266aa', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  unlockBtnDisabled: { opacity: 0.4 },
  unlockBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { color: GAME_COLORS.ui.textDim, fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  abilityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: GAME_COLORS.ui.panel, borderRadius: 8, padding: 10, marginBottom: 6 },
  abilityIcon: { fontSize: 24, marginRight: 10, width: 32, textAlign: 'center' },
  abilityInfo: { flex: 1 },
  abilityName: { color: GAME_COLORS.ui.text, fontSize: 14, fontWeight: '600' },
  abilityDesc: { color: GAME_COLORS.ui.textDim, fontSize: 11, marginTop: 2 },
  skinRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: GAME_COLORS.ui.panel, borderRadius: 8, padding: 10, marginBottom: 6 },
  skinPreview: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, marginRight: 10 },
  skinInfo: { flex: 1 },
  skinName: { fontSize: 14, fontWeight: '600' },
  skinRarity: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  skinBtn: { backgroundColor: '#2a3a5a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  skinBtnEquipped: { backgroundColor: '#226622' },
  skinBtnDisabled: { opacity: 0.4 },
  skinBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
