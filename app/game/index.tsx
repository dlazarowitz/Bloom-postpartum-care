import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HEROES, HERO_UNLOCK_COST, RANKED_DIVISIONS, GAME_COLORS, QUESTS } from '../../src/game/data';
import { HeroDef, GameMode, DifficultyLevel } from '../../src/game/types';
import {
  getProfile, isHeroUnlocked, claimQuestReward,
} from '../../src/game/progression';

const CLASS_COLORS: Record<string, string> = {
  warrior: '#ff8844', mage: '#8844ff', archer: '#44cc44',
  tank: '#4488ff', assassin: '#ff4488', support: '#44ddaa',
};

export default function LobbyScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'play' | 'quests'>('play');
  const [selectedHero, setSelectedHero] = useState<HeroDef>(HEROES[0]);
  const [gameMode, setGameMode] = useState<GameMode>('quick');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('normal');
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);
  const profile = getProfile();
  const heroUnlocked = isHeroUnlocked(selectedHero.id);

  const handleStart = () => {
    if (!heroUnlocked) return;
    router.push({
      pathname: '/game/play',
      params: { heroId: selectedHero.id, mode: gameMode, difficulty },
    });
  };

  const handleTutorial = () => {
    router.push({
      pathname: '/game/play',
      params: { heroId: selectedHero.id, mode: 'practice', difficulty: 'easy', tutorial: 'true' },
    });
  };

  const rankedInfo = profile.ranked;
  const rankDiv = RANKED_DIVISIONS[rankedInfo.division];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ARENA BATTLE</Text>
        <View style={styles.currencyRow}>
          <Text style={styles.goldText}>💰 {profile.gold}</Text>
          <Text style={styles.gemsText}>💎 {profile.gems}</Text>
        </View>
      </View>

      {/* Nav buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, tab === 'play' && styles.navBtnActive]}
          onPress={() => setTab('play')}
        >
          <Text style={[styles.navBtnText, tab === 'play' && styles.navBtnTextActive]}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, tab === 'quests' && styles.navBtnActive]}
          onPress={() => setTab('quests')}
        >
          <Text style={[styles.navBtnText, tab === 'quests' && styles.navBtnTextActive]}>Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/game/collection' as any)}>
          <Text style={styles.navBtnText}>Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/game/battle-pass' as any)}>
          <Text style={styles.navBtnText}>Pass</Text>
        </TouchableOpacity>
      </View>

      {tab === 'play' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Game Mode Selection */}
          <Text style={styles.sectionTitle}>GAME MODE</Text>
          <View style={styles.modeRow}>
            {([
              { mode: 'quick' as const, label: 'Quick Play', icon: '⚔️', desc: 'Jump into a match' },
              { mode: 'ranked' as const, label: 'Ranked', icon: '🏆', desc: `${rankDiv.icon} ${rankDiv.name} ${rankedInfo.stars}★` },
              { mode: 'practice' as const, label: 'Practice', icon: '🎯', desc: 'vs AI bots' },
            ]).map((m) => (
              <TouchableOpacity
                key={m.mode}
                style={[styles.modeCard, gameMode === m.mode && styles.modeCardActive]}
                onPress={() => setGameMode(m.mode)}
              >
                <Text style={styles.modeIcon}>{m.icon}</Text>
                <Text style={styles.modeLabel}>{m.label}</Text>
                <Text style={styles.modeDesc}>{m.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Difficulty (for practice) */}
          {gameMode === 'practice' && (
            <>
              <Text style={styles.sectionTitle}>DIFFICULTY</Text>
              <View style={styles.diffRow}>
                {([
                  { d: 'easy' as const, label: 'Easy', color: '#44cc44' },
                  { d: 'normal' as const, label: 'Normal', color: '#ddaa22' },
                  { d: 'hard' as const, label: 'Hard', color: '#ff4444' },
                ]).map((item) => (
                  <TouchableOpacity
                    key={item.d}
                    style={[styles.diffBtn, difficulty === item.d && { borderColor: item.color, borderWidth: 2 }]}
                    onPress={() => setDifficulty(item.d)}
                  >
                    <Text style={[styles.diffLabel, { color: item.color }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Ranked info */}
          {gameMode === 'ranked' && (
            <View style={styles.rankedCard}>
              <Text style={styles.rankedIcon}>{rankDiv.icon}</Text>
              <Text style={[styles.rankedDiv, { color: rankDiv.color }]}>{rankDiv.name}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: rankDiv.starsNeeded }, (_, i) => (
                  <Text key={i} style={styles.star}>{i < rankedInfo.stars ? '★' : '☆'}</Text>
                ))}
              </View>
              <Text style={styles.rankedRecord}>{rankedInfo.wins}W / {rankedInfo.losses}L</Text>
            </View>
          )}

          {/* Hero Selection */}
          <Text style={styles.sectionTitle}>SELECT HERO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroGrid}>
            {HEROES.map((hero) => {
              const isSelected = selectedHero.id === hero.id;
              const unlocked = isHeroUnlocked(hero.id);
              return (
                <TouchableOpacity
                  key={hero.id}
                  style={[styles.heroCard, isSelected && { borderColor: CLASS_COLORS[hero.class], borderWidth: 3 }, !unlocked && styles.heroCardLocked]}
                  onPress={() => setSelectedHero(hero)}
                >
                  <Text style={styles.heroIcon}>{hero.icon}</Text>
                  <Text style={styles.heroName}>{hero.name}</Text>
                  <Text style={[styles.heroClass, { color: CLASS_COLORS[hero.class] }]}>{hero.class.toUpperCase()}</Text>
                  {!unlocked && <Text style={styles.lockOverlay}>🔒</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Hero Detail */}
          <View style={styles.detailPanel}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailIcon}>{selectedHero.icon}</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{selectedHero.name}</Text>
                <Text style={[styles.detailTitle, { color: CLASS_COLORS[selectedHero.class] }]}>{selectedHero.title}</Text>
                <Text style={styles.detailDesc}>{selectedHero.description}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <StatBar label="HP" value={selectedHero.baseStats.maxHp} max={900} color="#44dd44" />
              <StatBar label="ATK" value={selectedHero.baseStats.attack} max={70} color="#ff6644" />
              <StatBar label="DEF" value={selectedHero.baseStats.defense} max={50} color="#4488ff" />
              <StatBar label="SPD" value={selectedHero.baseStats.moveSpeed} max={4.2} color="#ddaa22" />
            </View>
            <View style={styles.abilitiesRow}>
              {selectedHero.abilities.map((a) => (
                <View key={a.id} style={styles.abilityCard}>
                  <Text style={styles.abilityIcon}>{a.icon}</Text>
                  <Text style={styles.abilityName}>{a.name}</Text>
                  <Text style={styles.abilityCd}>{a.cooldown}s</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.tutorialBtn} onPress={handleTutorial}>
              <Text style={styles.tutorialBtnText}>📖 Tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: heroUnlocked ? CLASS_COLORS[selectedHero.class] : '#555' }]}
              onPress={handleStart}
              disabled={!heroUnlocked}
            >
              <Text style={styles.startText}>
                {heroUnlocked ? '⚔️ ENTER BATTLE' : `🔒 ${HERO_UNLOCK_COST[selectedHero.id] || 0} Gold`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>DAILY QUESTS</Text>
          {profile.quests.map((qp) => {
            const def = QUESTS.find((q: any) => q.id === qp.questId);
            if (!def) return null;
            const pct = Math.min(1, qp.current / def.target);
            return (
              <View key={qp.questId} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{def.title}</Text>
                  <Text style={styles.questReward}>💰{def.reward}</Text>
                </View>
                <Text style={styles.questDesc}>{def.description}</Text>
                <View style={styles.questBarBg}>
                  <View style={[styles.questBarFill, { width: `${pct * 100}%` }]} />
                </View>
                <View style={styles.questFooter}>
                  <Text style={styles.questProgress}>{qp.current}/{def.target}</Text>
                  {qp.completed && !qp.claimed && (
                    <TouchableOpacity style={styles.claimBtn} onPress={() => { claimQuestReward(qp.questId); refresh(); }}>
                      <Text style={styles.claimBtnText}>Claim</Text>
                    </TouchableOpacity>
                  )}
                  {qp.claimed && <Text style={styles.claimedText}>Claimed</Text>}
                </View>
              </View>
            );
          })}

          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>STATS</Text>
            <Text style={styles.statText}>Games Played: {profile.gamesPlayed}</Text>
            <Text style={styles.statText}>Total Kills: {profile.totalKills}</Text>
            <Text style={styles.statText}>Total Wins: {profile.totalWins}</Text>
            <Text style={styles.statText}>Win Rate: {profile.gamesPlayed > 0 ? Math.round((profile.totalWins / profile.gamesPlayed) * 100) : 0}%</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${Math.min(1, value / max) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GAME_COLORS.ui.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8 },
  backText: { color: '#88aacc', fontSize: 16 },
  title: { color: GAME_COLORS.ui.text, fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  currencyRow: { flexDirection: 'row', gap: 10 },
  goldText: { color: GAME_COLORS.gold, fontSize: 13, fontWeight: '600' },
  gemsText: { color: '#aa88ff', fontSize: 13, fontWeight: '600' },
  navRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 6 },
  navBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: GAME_COLORS.ui.panel, alignItems: 'center' },
  navBtnActive: { backgroundColor: '#2a3a5a', borderWidth: 1, borderColor: '#4488ff' },
  navBtnText: { color: GAME_COLORS.ui.textDim, fontSize: 12, fontWeight: '600' },
  navBtnTextActive: { color: '#4488ff' },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { color: GAME_COLORS.ui.textDim, fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 8, letterSpacing: 1 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeCard: { flex: 1, backgroundColor: GAME_COLORS.ui.panel, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: GAME_COLORS.ui.border },
  modeCardActive: { borderColor: '#4488ff', borderWidth: 2 },
  modeIcon: { fontSize: 24, marginBottom: 4 },
  modeLabel: { color: GAME_COLORS.ui.text, fontSize: 12, fontWeight: '700' },
  modeDesc: { color: GAME_COLORS.ui.textDim, fontSize: 10, marginTop: 2, textAlign: 'center' },
  diffRow: { flexDirection: 'row', gap: 8 },
  diffBtn: { flex: 1, backgroundColor: GAME_COLORS.ui.panel, borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: GAME_COLORS.ui.border },
  diffLabel: { fontSize: 14, fontWeight: '700' },
  rankedCard: { backgroundColor: GAME_COLORS.ui.panel, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  rankedIcon: { fontSize: 36 },
  rankedDiv: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  starsRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  star: { color: '#ffdd00', fontSize: 20 },
  rankedRecord: { color: GAME_COLORS.ui.textDim, fontSize: 12, marginTop: 6 },
  heroGrid: { paddingBottom: 8, gap: 8 },
  heroCard: { width: 80, height: 100, backgroundColor: GAME_COLORS.ui.panel, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: GAME_COLORS.ui.border },
  heroCardLocked: { opacity: 0.5 },
  heroIcon: { fontSize: 28, marginBottom: 4 },
  heroName: { color: GAME_COLORS.ui.text, fontSize: 11, fontWeight: '600' },
  heroClass: { fontSize: 8, fontWeight: '700', marginTop: 2 },
  lockOverlay: { position: 'absolute', fontSize: 16 },
  detailPanel: { backgroundColor: GAME_COLORS.ui.panel, borderRadius: 12, padding: 12, marginTop: 8 },
  detailHeader: { flexDirection: 'row', marginBottom: 10 },
  detailIcon: { fontSize: 36, marginRight: 12 },
  detailInfo: { flex: 1 },
  detailName: { color: GAME_COLORS.ui.text, fontSize: 18, fontWeight: '700' },
  detailTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  detailDesc: { color: GAME_COLORS.ui.textDim, fontSize: 11 },
  statsRow: { marginBottom: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statLabel: { color: GAME_COLORS.ui.textDim, fontSize: 10, fontWeight: '600', width: 30 },
  statBarBg: { flex: 1, height: 6, backgroundColor: '#1a2332', borderRadius: 3, marginHorizontal: 6, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3 },
  statValue: { color: GAME_COLORS.ui.text, fontSize: 10, width: 28, textAlign: 'right' },
  abilitiesRow: { flexDirection: 'row', gap: 6 },
  abilityCard: { flex: 1, backgroundColor: '#1a2332', borderRadius: 6, padding: 6, alignItems: 'center' },
  abilityIcon: { fontSize: 18 },
  abilityName: { color: GAME_COLORS.ui.text, fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  abilityCd: { color: GAME_COLORS.xp, fontSize: 9, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 32 },
  tutorialBtn: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#4488ff', alignItems: 'center', justifyContent: 'center' },
  tutorialBtnText: { color: '#4488ff', fontSize: 14, fontWeight: '700' },
  startBtn: { flex: 2, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  startText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  questCard: { backgroundColor: GAME_COLORS.ui.panel, borderRadius: 12, padding: 12, marginBottom: 8 },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  questTitle: { color: GAME_COLORS.ui.text, fontSize: 15, fontWeight: '700' },
  questReward: { color: GAME_COLORS.gold, fontSize: 14, fontWeight: '700' },
  questDesc: { color: GAME_COLORS.ui.textDim, fontSize: 12, marginBottom: 8 },
  questBarBg: { height: 6, backgroundColor: '#1a2332', borderRadius: 3, overflow: 'hidden' },
  questBarFill: { height: '100%', backgroundColor: '#44cc44', borderRadius: 3 },
  questFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  questProgress: { color: GAME_COLORS.ui.textDim, fontSize: 12 },
  claimBtn: { backgroundColor: '#226622', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  claimBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  claimedText: { color: '#44aa44', fontSize: 12, fontWeight: '600' },
  statsCard: { backgroundColor: GAME_COLORS.ui.panel, borderRadius: 12, padding: 12, marginTop: 4, marginBottom: 32 },
  statText: { color: GAME_COLORS.ui.text, fontSize: 14, marginBottom: 4 },
});
