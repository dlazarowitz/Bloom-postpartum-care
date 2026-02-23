import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HEROES } from '../../src/game/data';
import { HeroDef } from '../../src/game/types';

const { width: SCREEN_W } = Dimensions.get('window');

const CLASS_COLORS: Record<string, string> = {
  warrior: '#ff8844',
  mage: '#8844ff',
  archer: '#44cc44',
  tank: '#4488ff',
  assassin: '#ff4488',
  support: '#44ddaa',
};

export default function HeroSelectScreen() {
  const router = useRouter();
  const [selectedHero, setSelectedHero] = useState<HeroDef>(HEROES[0]);

  const handleStart = () => {
    router.push({ pathname: '/game/play', params: { heroId: selectedHero.id } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CHOOSE YOUR HERO</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Hero Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heroGrid}
      >
        {HEROES.map((hero) => {
          const isSelected = selectedHero.id === hero.id;
          const classColor = CLASS_COLORS[hero.class];
          return (
            <TouchableOpacity
              key={hero.id}
              style={[
                styles.heroCard,
                isSelected && { borderColor: classColor, borderWidth: 3 },
              ]}
              onPress={() => setSelectedHero(hero)}
              activeOpacity={0.7}
            >
              <Text style={styles.heroIcon}>{hero.icon}</Text>
              <Text style={styles.heroName}>{hero.name}</Text>
              <Text style={[styles.heroClass, { color: classColor }]}>
                {hero.class.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Hero Detail */}
      <View style={styles.detailPanel}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailIcon}>{selectedHero.icon}</Text>
          <View style={styles.detailInfo}>
            <Text style={styles.detailName}>{selectedHero.name}</Text>
            <Text
              style={[
                styles.detailTitle,
                { color: CLASS_COLORS[selectedHero.class] },
              ]}
            >
              {selectedHero.title}
            </Text>
            <Text style={styles.detailDesc}>{selectedHero.description}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBar label="HP" value={selectedHero.baseStats.maxHp} max={800} color="#44dd44" />
          <StatBar label="ATK" value={selectedHero.baseStats.attack} max={70} color="#ff6644" />
          <StatBar label="DEF" value={selectedHero.baseStats.defense} max={45} color="#4488ff" />
          <StatBar label="SPD" value={selectedHero.baseStats.moveSpeed} max={4} color="#ddaa22" />
        </View>

        {/* Abilities */}
        <View style={styles.abilitiesRow}>
          {selectedHero.abilities.map((ability, i) => (
            <View key={ability.id} style={styles.abilityCard}>
              <Text style={styles.abilityIcon}>{ability.icon}</Text>
              <Text style={styles.abilityName}>{ability.name}</Text>
              <Text style={styles.abilityDesc} numberOfLines={2}>
                {ability.description}
              </Text>
              <Text style={styles.abilityCd}>{ability.cooldown}s CD</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: CLASS_COLORS[selectedHero.class] }]}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Text style={styles.startText}>⚔️ ENTER BATTLE</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(1, value / max);
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e14',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backBtn: { width: 60 },
  backText: { color: '#88aacc', fontSize: 16 },
  title: {
    color: '#ddeeff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroGrid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  heroCard: {
    width: 100,
    height: 130,
    backgroundColor: '#151c28',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a3a4a',
    marginRight: 12,
  },
  heroIcon: { fontSize: 36, marginBottom: 8 },
  heroName: { color: '#ddeeff', fontSize: 13, fontWeight: '600' },
  heroClass: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  detailPanel: {
    flex: 1,
    backgroundColor: '#151c28',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: { fontSize: 48, marginRight: 16 },
  detailInfo: { flex: 1 },
  detailName: { color: '#ddeeff', fontSize: 24, fontWeight: '700' },
  detailTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  detailDesc: { color: '#889aaa', fontSize: 13, lineHeight: 18 },
  statsRow: { marginBottom: 16 },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    color: '#889aaa',
    fontSize: 12,
    fontWeight: '600',
    width: 36,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#1a2332',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  statBarFill: { height: '100%', borderRadius: 4 },
  statValue: { color: '#ddeeff', fontSize: 12, width: 36, textAlign: 'right' },
  abilitiesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  abilityCard: {
    flex: 1,
    backgroundColor: '#1a2332',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  abilityIcon: { fontSize: 24, marginBottom: 4 },
  abilityName: {
    color: '#ddeeff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  abilityDesc: {
    color: '#667788',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 4,
  },
  abilityCd: { color: '#ddaa22', fontSize: 10, fontWeight: '600' },
  startBtn: {
    margin: 16,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
