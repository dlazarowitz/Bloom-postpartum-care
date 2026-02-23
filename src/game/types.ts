export type Team = 'blue' | 'red';
export type EntityType = 'hero' | 'turret' | 'minion' | 'base' | 'projectile' | 'jungle';
export type HeroClass = 'warrior' | 'mage' | 'archer' | 'tank' | 'assassin' | 'support';

export interface Position {
  x: number;
  y: number;
}

export interface AbilityDef {
  id: string;
  name: string;
  icon: string;
  manaCost: number;
  cooldown: number;
  range: number;
  damage: number;
  healAmount?: number;
  effectRadius?: number;
  description: string;
}

export interface HeroDef {
  id: string;
  name: string;
  class: HeroClass;
  icon: string;
  title: string;
  description: string;
  baseStats: {
    maxHp: number;
    maxMana: number;
    attack: number;
    defense: number;
    attackRange: number;
    attackSpeed: number;
    moveSpeed: number;
    hpRegen: number;
    manaRegen: number;
  };
  growthPerLevel: {
    maxHp: number;
    maxMana: number;
    attack: number;
    defense: number;
  };
  abilities: [AbilityDef, AbilityDef, AbilityDef];
}

// ── Item System ─────────────────────────────────────────────────
export type ItemCategory = 'weapon' | 'armor' | 'boots' | 'magic' | 'consumable';

export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  cost: number;
  tier: 1 | 2 | 3;
  stats: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    maxMana?: number;
    moveSpeed?: number;
    attackSpeed?: number;
    hpRegen?: number;
    manaRegen?: number;
    lifesteal?: number;
  };
  description: string;
}

// ── Brush / Fog ─────────────────────────────────────────────────
export interface BrushZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Skins ───────────────────────────────────────────────────────
export type SkinRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SkinDef {
  id: string;
  heroId: string;
  name: string;
  icon: string;
  rarity: SkinRarity;
  price: number;
  bodyColor: string;
  borderColor: string;
}

// ── Quests ───────────────────────────────────────────────────────
export type QuestType = 'wins' | 'kills' | 'damage' | 'games' | 'class_games' | 'minion_kills' | 'turret_kills';

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number; // gold
  type: QuestType;
  classRequirement?: HeroClass;
}

export interface QuestProgress {
  questId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

// ── Battle Pass ─────────────────────────────────────────────────
export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward: BattlePassReward;
  premiumReward: BattlePassReward;
}

export interface BattlePassReward {
  type: 'gold' | 'gems' | 'skin' | 'hero';
  id?: string;
  amount?: number;
  label: string;
}

// ── Ranked ──────────────────────────────────────────────────────
export type RankedDivision = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';

export interface RankedInfo {
  division: RankedDivision;
  stars: number;
  maxStars: number;
  wins: number;
  losses: number;
}

// ── Ping ────────────────────────────────────────────────────────
export type PingType = 'attack' | 'retreat' | 'onMyWay' | 'danger';

export interface PingEvent {
  type: PingType;
  x: number;
  y: number;
  timestamp: number;
}

// ── Announcer ───────────────────────────────────────────────────
export interface AnnouncerEvent {
  text: string;
  color: string;
  timestamp: number;
}

// ── Death Recap ─────────────────────────────────────────────────
export interface DamageLogEntry {
  sourceId: string;
  sourceName: string;
  damage: number;
  timestamp: number;
  abilityName?: string;
}

// ── Game Modes ──────────────────────────────────────────────────
export type GameMode = 'quick' | 'ranked' | 'practice';
export type DifficultyLevel = 'easy' | 'normal' | 'hard';

// ── Draft Pick ──────────────────────────────────────────────────
export interface DraftState {
  phase: 'ban' | 'pick' | 'done';
  currentTeam: Team;
  blueBans: string[];
  redBans: string[];
  bluePicks: string[];
  redPicks: string[];
}

// ── Tutorial ────────────────────────────────────────────────────
export interface TutorialStep {
  id: string;
  title: string;
  message: string;
  action: 'move' | 'attack' | 'ability' | 'shop' | 'objective' | 'complete';
}

// ── Entities ────────────────────────────────────────────────────

export interface GameEntity {
  id: string;
  type: EntityType;
  team: Team;
  x: number;
  y: number;
  size: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  attackRange: number;
  attackSpeed: number;
  attackTimer: number;
  moveSpeed: number;
  targetId: string | null;
  isDead: boolean;
  respawnTimer: number;
  spawnX: number;
  spawnY: number;
  inBrush: boolean;
}

export interface HeroEntity extends GameEntity {
  type: 'hero';
  heroId: string;
  heroClass: HeroClass;
  level: number;
  xp: number;
  xpToNext: number;
  mana: number;
  maxMana: number;
  hpRegen: number;
  manaRegen: number;
  gold: number;
  kills: number;
  deaths: number;
  assists: number;
  abilities: AbilityState[];
  isPlayer: boolean;
  lastDamagedBy: string[];
  items: string[];
  skinId: string | null;
  damageLog: DamageLogEntry[];
  buffs: Buff[];
  totalDamageDealt: number;
  multiKillTimer: number;
  multiKillCount: number;
}

export interface Buff {
  id: string;
  name: string;
  icon: string;
  duration: number;
  remaining: number;
  stats: {
    attack?: number;
    defense?: number;
    moveSpeed?: number;
    hpRegen?: number;
    manaRegen?: number;
  };
}

export interface AbilityState {
  def: AbilityDef;
  cooldownRemaining: number;
}

export interface TurretEntity extends GameEntity {
  type: 'turret';
  tier: number;
}

export interface MinionEntity extends GameEntity {
  type: 'minion';
  variant: 'melee' | 'ranged';
  laneY: number;
}

export interface BaseEntity extends GameEntity {
  type: 'base';
}

export interface JungleEntity extends GameEntity {
  type: 'jungle';
  campId: string;
  buffType: 'attack' | 'mana' | 'team';
  respawnDelay: number;
  respawnCountdown: number;
  icon: string;
}

export interface Projectile {
  id: string;
  team: Team;
  x: number;
  y: number;
  targetId: string;
  damage: number;
  speed: number;
  size: number;
  sourceId: string;
  abilityName?: string;
}

export interface GameState {
  entities: Record<string, GameEntity>;
  projectiles: Projectile[];
  playerId: string;
  gameTime: number;
  isGameOver: boolean;
  winner: Team | null;
  blueKills: number;
  redKills: number;
  nextMinionWave: number;
  cameraX: number;
  cameraY: number;
  isPaused: boolean;
  killFeed: KillFeedEntry[];
  brushZones: BrushZone[];
  announcements: AnnouncerEvent[];
  pings: PingEvent[];
  gameMode: GameMode;
  difficulty: DifficultyLevel;
  firstBlood: boolean;
}

export interface KillFeedEntry {
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  killerTeam: Team;
  timestamp: number;
}

export interface GameInput {
  moveX: number;
  moveY: number;
  attackPressed: boolean;
  abilityIndex: number;
  buyItemId?: string;
  pingType?: PingType;
}

export interface RenderEntity {
  id: string;
  type: EntityType;
  team: Team;
  x: number;
  y: number;
  size: number;
  hp: number;
  maxHp: number;
  isDead: boolean;
  icon?: string;
  name?: string;
  level?: number;
  isPlayer?: boolean;
  mana?: number;
  maxMana?: number;
  heroClass?: HeroClass;
  inBrush?: boolean;
  buffs?: { icon: string }[];
  bodyColor?: string;
  borderColor?: string;
}

// ── Progression State ───────────────────────────────────────────
export interface PlayerProfile {
  gems: number;
  gold: number;
  unlockedHeroes: string[];
  ownedSkins: string[];
  equippedSkins: Record<string, string>; // heroId -> skinId
  ranked: RankedInfo;
  battlePassXp: number;
  battlePassPremium: boolean;
  battlePassClaimed: number[];
  quests: QuestProgress[];
  gamesPlayed: number;
  totalKills: number;
  totalWins: number;
}
