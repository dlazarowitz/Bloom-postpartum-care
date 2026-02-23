import {
  PlayerProfile,
  RankedDivision,
  QuestProgress,
  HeroEntity,
  GameState,
} from './types';
import { QUESTS, RANKED_DIVISIONS } from './data';

// ── Default Profile ─────────────────────────────────────────────
function createDefaultProfile(): PlayerProfile {
  return {
    gems: 0,
    gold: 500,
    unlockedHeroes: ['varen', 'lyra', 'kael', 'borin'],
    ownedSkins: [],
    equippedSkins: {},
    ranked: {
      division: 'bronze',
      stars: 0,
      maxStars: 3,
      wins: 0,
      losses: 0,
    },
    battlePassXp: 0,
    battlePassPremium: false,
    battlePassClaimed: [],
    quests: generateDailyQuests(),
    gamesPlayed: 0,
    totalKills: 0,
    totalWins: 0,
  };
}

let profile: PlayerProfile = createDefaultProfile();

// ── Profile Access ──────────────────────────────────────────────
export function getProfile(): PlayerProfile {
  return profile;
}

export function resetProfile(): void {
  profile = createDefaultProfile();
}

// ── Currency ────────────────────────────────────────────────────
export function addGold(amount: number): void {
  profile.gold += amount;
}

export function spendGold(amount: number): boolean {
  if (profile.gold < amount) return false;
  profile.gold -= amount;
  return true;
}

export function addGems(amount: number): void {
  profile.gems += amount;
}

export function spendGems(amount: number): boolean {
  if (profile.gems < amount) return false;
  profile.gems -= amount;
  return true;
}

// ── Hero Unlocks ────────────────────────────────────────────────
export function isHeroUnlocked(heroId: string): boolean {
  return profile.unlockedHeroes.indexOf(heroId) !== -1;
}

export function unlockHero(heroId: string, cost: number): boolean {
  if (isHeroUnlocked(heroId)) return false;
  if (!spendGold(cost)) return false;
  profile.unlockedHeroes.push(heroId);
  return true;
}

// ── Skins ───────────────────────────────────────────────────────
export function ownsSkin(skinId: string): boolean {
  return profile.ownedSkins.indexOf(skinId) !== -1;
}

export function buySkin(skinId: string, cost: number): boolean {
  if (ownsSkin(skinId)) return false;
  if (!spendGems(cost)) return false;
  profile.ownedSkins.push(skinId);
  return true;
}

export function equipSkin(heroId: string, skinId: string | null): void {
  if (skinId === null) {
    delete profile.equippedSkins[heroId];
  } else {
    profile.equippedSkins[heroId] = skinId;
  }
}

export function getEquippedSkin(heroId: string): string | null {
  return profile.equippedSkins[heroId] || null;
}

// ── Ranked ──────────────────────────────────────────────────────
const DIVISION_ORDER: RankedDivision[] = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster',
];

export function updateRanked(won: boolean): void {
  const r = profile.ranked;
  if (won) {
    r.wins++;
    r.stars++;
    const divInfo = RANKED_DIVISIONS[r.division];
    if (r.stars >= divInfo.starsNeeded) {
      const idx = DIVISION_ORDER.indexOf(r.division);
      if (idx < DIVISION_ORDER.length - 1) {
        r.division = DIVISION_ORDER[idx + 1];
        r.stars = 0;
        r.maxStars = RANKED_DIVISIONS[r.division].starsNeeded;
      }
    }
  } else {
    r.losses++;
    r.stars = Math.max(0, r.stars - 1);
  }
}

// ── Battle Pass ─────────────────────────────────────────────────
export function addBattlePassXp(amount: number): void {
  profile.battlePassXp += amount;
}

export function getBattlePassTier(): number {
  let xp = profile.battlePassXp;
  let tier = 0;
  const xpPerTier = 200;
  while (xp >= xpPerTier && tier < 30) {
    xp -= xpPerTier;
    tier++;
  }
  return tier;
}

export function getBattlePassProgress(): { tier: number; xpInTier: number; xpForTier: number } {
  let xp = profile.battlePassXp;
  let tier = 0;
  const xpPerTier = 200;
  while (xp >= xpPerTier && tier < 30) {
    xp -= xpPerTier;
    tier++;
  }
  return { tier, xpInTier: xp, xpForTier: xpPerTier };
}

export function claimBattlePassReward(tier: number): boolean {
  if (profile.battlePassClaimed.indexOf(tier) !== -1) return false;
  if (getBattlePassTier() < tier) return false;
  profile.battlePassClaimed.push(tier);
  return true;
}

export function buyBattlePassPremium(): boolean {
  if (profile.battlePassPremium) return false;
  if (!spendGems(500)) return false;
  profile.battlePassPremium = true;
  return true;
}

// ── Daily Quests ────────────────────────────────────────────────
function generateDailyQuests(): QuestProgress[] {
  const shuffled = [...QUESTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((q) => ({
    questId: q.id,
    current: 0,
    completed: false,
    claimed: false,
  }));
}

export function refreshQuests(): void {
  profile.quests = generateDailyQuests();
}

export function updateQuestProgress(
  type: string,
  amount: number,
  heroClass?: string
): void {
  for (const qp of profile.quests) {
    if (qp.completed) continue;
    const def = QUESTS.find((q: any) => q.id === qp.questId);
    if (!def) continue;
    if (def.type !== type) continue;
    if (def.classRequirement && def.classRequirement !== heroClass) continue;
    qp.current = Math.min(qp.current + amount, def.target);
    if (qp.current >= def.target) {
      qp.completed = true;
    }
  }
}

export function claimQuestReward(questId: string): boolean {
  const qp = profile.quests.find((q) => q.questId === questId);
  if (!qp || !qp.completed || qp.claimed) return false;
  const def = QUESTS.find((q: any) => q.id === questId);
  if (!def) return false;
  qp.claimed = true;
  addGold(def.reward);
  return true;
}

// ── Post-Game Update ────────────────────────────────────────────
export function processGameEnd(
  state: GameState,
  won: boolean,
  playerHero: HeroEntity
): void {
  profile.gamesPlayed++;
  profile.totalKills += playerHero.kills;
  if (won) profile.totalWins++;

  // Gold reward
  const goldReward = won ? 100 : 40;
  addGold(goldReward + playerHero.gold);

  // Battle pass XP
  const bpXp = won ? 50 : 20;
  addBattlePassXp(bpXp + playerHero.kills * 5);

  // Quest progress
  if (won) updateQuestProgress('wins', 1, playerHero.heroClass);
  updateQuestProgress('games', 1, playerHero.heroClass);
  updateQuestProgress('kills', playerHero.kills, playerHero.heroClass);
  updateQuestProgress('class_games', 1, playerHero.heroClass);

  // Ranked
  if (state.gameMode === 'ranked') {
    updateRanked(won);
  }
}
