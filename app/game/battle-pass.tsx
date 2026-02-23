import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BATTLE_PASS_TIERS, GAME_COLORS } from '../../src/game/data';
import {
  getProfile, getBattlePassProgress, claimBattlePassReward, buyBattlePassPremium,
} from '../../src/game/progression';

export default function BattlePassScreen() {
  const router = useRouter();
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);
  const profile = getProfile();
  const progress = getBattlePassProgress();

  const handleClaim = (tier: number) => {
    if (claimBattlePassReward(tier)) refresh();
  };

  const handleBuyPremium = () => {
    if (buyBattlePassPremium()) refresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SEASON PASS</Text>
        <Text style={styles.gemsText}>💎 {profile.gems}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.tierText}>Tier {progress.tier}/30</Text>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${(progress.xpInTier / progress.xpForTier) * 100}%` }]} />
        </View>
        <Text style={styles.xpText}>{progress.xpInTier}/{progress.xpForTier} XP</Text>
      </View>

      {!profile.battlePassPremium && (
        <TouchableOpacity style={styles.premiumBtn} onPress={handleBuyPremium}>
          <Text style={styles.premiumBtnText}>Upgrade to Premium (💎500)</Text>
          <Text style={styles.premiumBtnSub}>Unlock exclusive skins and bonus rewards!</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.tierList} showsVerticalScrollIndicator={false}>
        {BATTLE_PASS_TIERS.map((tier) => {
          const unlocked = progress.tier >= tier.tier;
          const claimed = profile.battlePassClaimed.indexOf(tier.tier) !== -1;
          const canClaim = unlocked && !claimed;
          const isSpecial = tier.tier % 5 === 0;

          return (
            <View key={tier.tier} style={[styles.tierRow, isSpecial && styles.tierRowSpecial]}>
              <View style={[styles.tierNum, unlocked && styles.tierNumUnlocked]}>
                <Text style={styles.tierNumText}>{tier.tier}</Text>
              </View>

              {/* Free reward */}
              <View style={[styles.rewardBox, unlocked && styles.rewardBoxUnlocked]}>
                <Text style={styles.rewardLabel}>FREE</Text>
                <Text style={styles.rewardText}>{tier.freeReward.label}</Text>
                {canClaim && (
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(tier.tier)}>
                    <Text style={styles.claimBtnText}>Claim</Text>
                  </TouchableOpacity>
                )}
                {claimed && <Text style={styles.claimedText}>Claimed</Text>}
              </View>

              {/* Premium reward */}
              <View style={[styles.rewardBox, styles.premiumBox, unlocked && profile.battlePassPremium && styles.rewardBoxUnlocked]}>
                <Text style={styles.premiumLabel}>PREMIUM</Text>
                <Text style={styles.rewardText}>{tier.premiumReward.label}</Text>
                {canClaim && profile.battlePassPremium && (
                  <TouchableOpacity style={[styles.claimBtn, styles.premiumClaimBtn]} onPress={() => handleClaim(tier.tier)}>
                    <Text style={styles.claimBtnText}>Claim</Text>
                  </TouchableOpacity>
                )}
                {!profile.battlePassPremium && <Text style={styles.lockedText}>🔒</Text>}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GAME_COLORS.ui.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  backText: { color: '#88aacc', fontSize: 16 },
  title: { color: GAME_COLORS.ui.text, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
  gemsText: { color: '#aa88ff', fontSize: 14, fontWeight: '600' },
  progressSection: { paddingHorizontal: 16, marginBottom: 12 },
  tierText: { color: GAME_COLORS.ui.text, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  xpBarBg: { height: 10, backgroundColor: '#1a2332', borderRadius: 5, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: GAME_COLORS.xp, borderRadius: 5 },
  xpText: { color: GAME_COLORS.ui.textDim, fontSize: 12, marginTop: 4 },
  premiumBtn: { marginHorizontal: 16, backgroundColor: '#3a2060', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#7744cc' },
  premiumBtnText: { color: '#ddaaff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  premiumBtnSub: { color: '#9977bb', fontSize: 12, textAlign: 'center', marginTop: 4 },
  tierList: { flex: 1, paddingHorizontal: 16 },
  tierRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tierRowSpecial: { marginBottom: 10 },
  tierNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a2332', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  tierNumUnlocked: { backgroundColor: '#2a4a2a' },
  tierNumText: { color: GAME_COLORS.ui.text, fontSize: 12, fontWeight: '700' },
  rewardBox: { flex: 1, backgroundColor: GAME_COLORS.ui.panel, borderRadius: 8, padding: 8, marginRight: 6, opacity: 0.5 },
  rewardBoxUnlocked: { opacity: 1 },
  premiumBox: { borderWidth: 1, borderColor: '#44337755' },
  rewardLabel: { color: GAME_COLORS.ui.textDim, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  premiumLabel: { color: '#9977bb', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  rewardText: { color: GAME_COLORS.ui.text, fontSize: 11, fontWeight: '600', marginTop: 2 },
  claimBtn: { backgroundColor: '#226622', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, marginTop: 4, alignSelf: 'flex-start' },
  premiumClaimBtn: { backgroundColor: '#553399' },
  claimBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  claimedText: { color: '#44aa44', fontSize: 10, fontWeight: '600', marginTop: 4 },
  lockedText: { fontSize: 12, marginTop: 4 },
});
