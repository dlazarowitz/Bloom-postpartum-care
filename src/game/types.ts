export type Team = 'blue' | 'red';
export type EntityType = 'hero' | 'turret' | 'minion' | 'base' | 'projectile';
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

export interface Projectile {
  id: string;
  team: Team;
  x: number;
  y: number;
  targetId: string;
  damage: number;
  speed: number;
  size: number;
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
  abilityIndex: number; // -1 = none
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
}
