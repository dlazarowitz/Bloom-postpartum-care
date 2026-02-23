import {
  HeroDef, ItemDef, BrushZone, SkinDef, QuestDef,
  BattlePassTier, RankedDivision, Position, TutorialStep,
} from './types';

// ── 15 Original Heroes ──────────────────────────────────────────
export const HEROES: HeroDef[] = [
  // ─── WARRIORS ───
  {
    id: 'varen', name: 'Varen', class: 'warrior', icon: '⚔️',
    title: 'Ironclad Vanguard',
    description: 'A balanced warrior who excels at diving into fights with his charge abilities.',
    baseStats: { maxHp: 600, maxMana: 300, attack: 55, defense: 30, attackRange: 60, attackSpeed: 1.0, moveSpeed: 3.5, hpRegen: 3, manaRegen: 2 },
    growthPerLevel: { maxHp: 80, maxMana: 30, attack: 8, defense: 5 },
    abilities: [
      { id: 'dash', name: 'Iron Charge', icon: '💨', manaCost: 40, cooldown: 6, range: 200, damage: 80, description: 'Charge forward dealing damage to enemies in path.' },
      { id: 'sweep', name: 'Whirlwind Slash', icon: '🌀', manaCost: 50, cooldown: 8, range: 100, damage: 120, effectRadius: 100, description: 'Spin your blade in a circle damaging all nearby enemies.' },
      { id: 'wrath', name: 'Wrath of Steel', icon: '🐉', manaCost: 80, cooldown: 30, range: 150, damage: 250, effectRadius: 120, description: 'Ultimate: Unleash a devastating shockwave dealing massive area damage.' },
    ],
  },
  {
    id: 'thane', name: 'Thane', class: 'warrior', icon: '🪓',
    title: 'Raging Berserker',
    description: 'A fearsome brawler who grows stronger as the battle rages on.',
    baseStats: { maxHp: 650, maxMana: 250, attack: 60, defense: 25, attackRange: 55, attackSpeed: 1.1, moveSpeed: 3.4, hpRegen: 4, manaRegen: 1 },
    growthPerLevel: { maxHp: 85, maxMana: 25, attack: 10, defense: 4 },
    abilities: [
      { id: 'cleave', name: 'Cleave', icon: '🪓', manaCost: 30, cooldown: 4, range: 80, damage: 70, effectRadius: 80, description: 'Swing your axe in a wide cleave hitting all enemies in front.' },
      { id: 'frenzy', name: 'Battle Frenzy', icon: '😤', manaCost: 50, cooldown: 12, range: 0, damage: 0, description: 'Enter a frenzy, boosting attack speed and movement speed.' },
      { id: 'rampage', name: 'Rampage', icon: '💢', manaCost: 80, cooldown: 28, range: 120, damage: 280, effectRadius: 110, description: 'Ultimate: Go on a rampage, dealing massive damage in an area.' },
    ],
  },
  {
    id: 'caelum', name: 'Caelum', class: 'warrior', icon: '🌪️',
    title: 'Stormcaller',
    description: 'A wind warrior who commands gales to disrupt and damage enemies.',
    baseStats: { maxHp: 550, maxMana: 350, attack: 50, defense: 28, attackRange: 70, attackSpeed: 1.0, moveSpeed: 3.6, hpRegen: 3, manaRegen: 3 },
    growthPerLevel: { maxHp: 75, maxMana: 35, attack: 9, defense: 4 },
    abilities: [
      { id: 'gust', name: 'Gale Strike', icon: '💨', manaCost: 35, cooldown: 5, range: 180, damage: 75, description: 'Send a cutting gust toward the nearest enemy.' },
      { id: 'cyclone', name: 'Cyclone', icon: '🌀', manaCost: 55, cooldown: 10, range: 0, damage: 90, effectRadius: 130, description: 'Summon a cyclone around you, damaging and pushing back all nearby enemies.' },
      { id: 'tempest', name: 'Tempest', icon: '⛈️', manaCost: 90, cooldown: 32, range: 250, damage: 270, effectRadius: 150, description: 'Ultimate: Call down a massive tempest dealing devastating area damage.' },
    ],
  },
  // ─── MAGES ───
  {
    id: 'lyra', name: 'Lyra', class: 'mage', icon: '🔥',
    title: 'Ember Sorceress',
    description: 'A powerful mage who rains fire upon enemies from a safe distance.',
    baseStats: { maxHp: 420, maxMana: 450, attack: 40, defense: 18, attackRange: 180, attackSpeed: 0.7, moveSpeed: 3.0, hpRegen: 2, manaRegen: 4 },
    growthPerLevel: { maxHp: 55, maxMana: 45, attack: 12, defense: 3 },
    abilities: [
      { id: 'fireball', name: 'Ember Bolt', icon: '🔴', manaCost: 35, cooldown: 4, range: 250, damage: 100, description: 'Hurl a bolt of fire at the nearest enemy.' },
      { id: 'flame_wall', name: 'Scorched Earth', icon: '🧱', manaCost: 60, cooldown: 10, range: 200, damage: 80, effectRadius: 120, description: 'Ignite the ground beneath enemies, burning all in the area.' },
      { id: 'inferno', name: 'Cataclysm', icon: '☄️', manaCost: 100, cooldown: 35, range: 300, damage: 350, effectRadius: 150, description: 'Ultimate: Call down a meteor storm dealing devastating damage in a large area.' },
    ],
  },
  {
    id: 'crysta', name: 'Crysta', class: 'mage', icon: '❄️',
    title: 'Frostweaver',
    description: 'An ice mage who freezes enemies in place and shatters them.',
    baseStats: { maxHp: 400, maxMana: 480, attack: 38, defense: 16, attackRange: 190, attackSpeed: 0.7, moveSpeed: 2.9, hpRegen: 2, manaRegen: 5 },
    growthPerLevel: { maxHp: 50, maxMana: 50, attack: 11, defense: 3 },
    abilities: [
      { id: 'ice_shard', name: 'Ice Shard', icon: '🧊', manaCost: 30, cooldown: 4, range: 240, damage: 90, description: 'Launch a shard of ice at the nearest enemy.' },
      { id: 'blizzard', name: 'Blizzard', icon: '🌨️', manaCost: 65, cooldown: 11, range: 220, damage: 100, effectRadius: 140, description: 'Conjure a blizzard damaging all enemies in a wide area.' },
      { id: 'absolute_zero', name: 'Absolute Zero', icon: '💎', manaCost: 110, cooldown: 38, range: 280, damage: 380, effectRadius: 130, description: 'Ultimate: Freeze the area in absolute zero, dealing massive ice damage.' },
    ],
  },
  // ─── ARCHERS ───
  {
    id: 'kael', name: 'Kael', class: 'archer', icon: '🏹',
    title: 'Sharpshooter',
    description: 'A ranged marksman who picks off enemies from afar with deadly accuracy.',
    baseStats: { maxHp: 380, maxMana: 280, attack: 65, defense: 15, attackRange: 220, attackSpeed: 1.2, moveSpeed: 3.2, hpRegen: 2, manaRegen: 2 },
    growthPerLevel: { maxHp: 50, maxMana: 25, attack: 14, defense: 2 },
    abilities: [
      { id: 'scatter_shot', name: 'Split Arrow', icon: '🎯', manaCost: 30, cooldown: 5, range: 250, damage: 70, effectRadius: 80, description: 'Fire splitting arrows that hit multiple enemies.' },
      { id: 'arrow_rain', name: 'Hail of Arrows', icon: '🌧️', manaCost: 55, cooldown: 10, range: 300, damage: 110, effectRadius: 130, description: 'Rain arrows down on a target area.' },
      { id: 'deadeye', name: 'Deadeye', icon: '☀️', manaCost: 90, cooldown: 35, range: 400, damage: 300, description: 'Ultimate: Fire a perfectly aimed shot that deals massive single-target damage.' },
    ],
  },
  {
    id: 'astra', name: 'Astra', class: 'archer', icon: '✴️',
    title: 'Star Archer',
    description: 'A celestial archer whose arrows carry the power of starlight.',
    baseStats: { maxHp: 360, maxMana: 300, attack: 60, defense: 14, attackRange: 230, attackSpeed: 1.1, moveSpeed: 3.3, hpRegen: 2, manaRegen: 3 },
    growthPerLevel: { maxHp: 48, maxMana: 30, attack: 13, defense: 2 },
    abilities: [
      { id: 'star_bolt', name: 'Star Bolt', icon: '⭐', manaCost: 25, cooldown: 3, range: 260, damage: 65, description: 'Fire a star-infused bolt at the nearest enemy.' },
      { id: 'constellation', name: 'Constellation', icon: '✨', manaCost: 50, cooldown: 9, range: 280, damage: 95, effectRadius: 110, description: 'Call down starlight on an area, damaging all enemies within.' },
      { id: 'supernova', name: 'Supernova', icon: '💫', manaCost: 95, cooldown: 36, range: 350, damage: 320, effectRadius: 140, description: 'Ultimate: Unleash a supernova blast dealing massive area damage at range.' },
    ],
  },
  // ─── TANKS ───
  {
    id: 'borin', name: 'Borin', class: 'tank', icon: '🛡️',
    title: 'Stone Guardian',
    description: 'A mighty tank who absorbs damage and protects allies with his towering shield.',
    baseStats: { maxHp: 800, maxMana: 250, attack: 35, defense: 45, attackRange: 55, attackSpeed: 0.8, moveSpeed: 3.0, hpRegen: 5, manaRegen: 2 },
    growthPerLevel: { maxHp: 110, maxMana: 20, attack: 5, defense: 8 },
    abilities: [
      { id: 'shield_bash', name: 'Bastion Slam', icon: '💥', manaCost: 35, cooldown: 6, range: 80, damage: 60, description: 'Slam your shield into nearby enemies.' },
      { id: 'war_cry', name: 'Rally', icon: '📣', manaCost: 50, cooldown: 12, range: 150, damage: 40, effectRadius: 150, healAmount: 100, description: 'Rally your allies, damaging enemies and healing allies nearby.' },
      { id: 'fortress', name: 'Living Fortress', icon: '🏔️', manaCost: 80, cooldown: 40, range: 0, damage: 0, healAmount: 400, effectRadius: 200, description: 'Ultimate: Become an immovable fortress, restoring HP and shielding nearby allies.' },
    ],
  },
  {
    id: 'tharros', name: 'Tharros', class: 'tank', icon: '🗿',
    title: 'Iron Colossus',
    description: 'A colossal titan whose mere presence disrupts enemy formations.',
    baseStats: { maxHp: 900, maxMana: 200, attack: 30, defense: 50, attackRange: 50, attackSpeed: 0.7, moveSpeed: 2.8, hpRegen: 6, manaRegen: 1 },
    growthPerLevel: { maxHp: 120, maxMana: 18, attack: 4, defense: 10 },
    abilities: [
      { id: 'quake', name: 'Ground Quake', icon: '🌋', manaCost: 40, cooldown: 7, range: 90, damage: 50, effectRadius: 110, description: 'Slam the ground causing a quake that damages nearby enemies.' },
      { id: 'iron_wall', name: 'Iron Wall', icon: '🧱', manaCost: 45, cooldown: 14, range: 0, damage: 0, healAmount: 150, description: 'Raise an iron wall, restoring HP and boosting defense temporarily.' },
      { id: 'titan_fury', name: 'Titan Fury', icon: '⚡', manaCost: 75, cooldown: 35, range: 100, damage: 180, effectRadius: 160, healAmount: 300, description: 'Ultimate: Erupt with titanic fury, dealing damage to all nearby enemies and healing massively.' },
    ],
  },
  // ─── ASSASSINS ───
  {
    id: 'shade', name: 'Shade', class: 'assassin', icon: '🗡️',
    title: 'Phantom Blade',
    description: 'A lightning-fast assassin who strikes from the shadows with deadly precision.',
    baseStats: { maxHp: 450, maxMana: 320, attack: 70, defense: 20, attackRange: 55, attackSpeed: 1.3, moveSpeed: 4.0, hpRegen: 2, manaRegen: 3 },
    growthPerLevel: { maxHp: 60, maxMana: 30, attack: 15, defense: 3 },
    abilities: [
      { id: 'shadow_step', name: 'Blink Strike', icon: '👤', manaCost: 35, cooldown: 5, range: 180, damage: 90, description: 'Teleport behind the nearest enemy and strike.' },
      { id: 'blade_dance', name: 'Phantom Flurry', icon: '💃', manaCost: 50, cooldown: 8, range: 100, damage: 140, effectRadius: 90, description: 'Unleash a flurry of slashes hitting all nearby enemies.' },
      { id: 'execute', name: 'Death Mark', icon: '⚡', manaCost: 90, cooldown: 30, range: 120, damage: 400, description: 'Ultimate: Mark a target for death, dealing devastating single-target damage.' },
    ],
  },
  {
    id: 'vesper', name: 'Vesper', class: 'assassin', icon: '🦇',
    title: 'Nightstalker',
    description: 'A nocturnal assassin who thrives in darkness and hunts isolated targets.',
    baseStats: { maxHp: 430, maxMana: 300, attack: 68, defense: 18, attackRange: 55, attackSpeed: 1.4, moveSpeed: 4.2, hpRegen: 2, manaRegen: 3 },
    growthPerLevel: { maxHp: 55, maxMana: 28, attack: 16, defense: 2 },
    abilities: [
      { id: 'night_strike', name: 'Night Strike', icon: '🌙', manaCost: 30, cooldown: 4, range: 160, damage: 85, description: 'Lunge from the darkness striking the nearest enemy.' },
      { id: 'shadow_step', name: 'Umbral Step', icon: '🌑', manaCost: 45, cooldown: 7, range: 200, damage: 0, description: 'Vanish into shadow and reposition behind your target.' },
      { id: 'eclipse', name: 'Eclipse', icon: '🌒', manaCost: 85, cooldown: 28, range: 110, damage: 420, description: 'Ultimate: Engulf the target in total eclipse dealing devastating damage.' },
    ],
  },
  // ─── SUPPORTS ───
  {
    id: 'solara', name: 'Solara', class: 'support', icon: '💚',
    title: 'Radiant Mender',
    description: 'A healer who sustains allies and weakens enemies with radiant energy.',
    baseStats: { maxHp: 480, maxMana: 400, attack: 30, defense: 22, attackRange: 160, attackSpeed: 0.8, moveSpeed: 3.2, hpRegen: 3, manaRegen: 5 },
    growthPerLevel: { maxHp: 60, maxMana: 40, attack: 6, defense: 4 },
    abilities: [
      { id: 'heal', name: 'Mending Light', icon: '✨', manaCost: 40, cooldown: 6, range: 200, damage: 0, healAmount: 120, effectRadius: 120, description: 'Heal yourself and nearby allies.' },
      { id: 'poison', name: 'Searing Ray', icon: '☠️', manaCost: 35, cooldown: 5, range: 200, damage: 90, description: 'Fire a searing ray at the nearest enemy.' },
      { id: 'resurrection', name: 'Divine Renewal', icon: '🌟', manaCost: 120, cooldown: 60, range: 0, damage: 0, healAmount: 500, effectRadius: 200, description: 'Ultimate: Fully restore HP and heal all nearby allies massively.' },
    ],
  },
  {
    id: 'sera', name: 'Sera', class: 'support', icon: '🔰',
    title: 'Aegis Bearer',
    description: 'A protective support who shields allies and controls the battlefield.',
    baseStats: { maxHp: 520, maxMana: 380, attack: 28, defense: 28, attackRange: 140, attackSpeed: 0.7, moveSpeed: 3.1, hpRegen: 4, manaRegen: 4 },
    growthPerLevel: { maxHp: 65, maxMana: 35, attack: 5, defense: 6 },
    abilities: [
      { id: 'barrier', name: 'Barrier', icon: '🛡️', manaCost: 45, cooldown: 7, range: 180, damage: 0, healAmount: 100, effectRadius: 100, description: 'Create a barrier that heals nearby allies.' },
      { id: 'smite', name: 'Holy Smite', icon: '⚡', manaCost: 40, cooldown: 6, range: 190, damage: 80, description: 'Strike an enemy with holy energy.' },
      { id: 'sanctuary', name: 'Sanctuary', icon: '🏛️', manaCost: 100, cooldown: 45, range: 0, damage: 0, healAmount: 350, effectRadius: 180, description: 'Ultimate: Create a sanctuary that massively heals all nearby allies.' },
    ],
  },
  {
    id: 'cindra', name: 'Cindra', class: 'mage', icon: '🌸',
    title: 'Blossom Witch',
    description: 'A nature mage who channels floral energy to damage and heal.',
    baseStats: { maxHp: 440, maxMana: 420, attack: 42, defense: 20, attackRange: 170, attackSpeed: 0.8, moveSpeed: 3.1, hpRegen: 3, manaRegen: 4 },
    growthPerLevel: { maxHp: 55, maxMana: 40, attack: 10, defense: 3 },
    abilities: [
      { id: 'thorn', name: 'Thorn Lash', icon: '🌿', manaCost: 30, cooldown: 4, range: 200, damage: 85, description: 'Lash enemies with thorny vines.' },
      { id: 'bloom', name: 'Bloom Field', icon: '🌺', manaCost: 55, cooldown: 10, range: 180, damage: 70, effectRadius: 120, healAmount: 80, description: 'Create a field of blooms that damages enemies and heals allies.' },
      { id: 'overgrowth', name: 'Overgrowth', icon: '🌳', manaCost: 95, cooldown: 34, range: 250, damage: 300, effectRadius: 160, healAmount: 200, description: 'Ultimate: Unleash massive overgrowth dealing area damage and healing allies.' },
    ],
  },
  {
    id: 'auric', name: 'Auric', class: 'tank', icon: '👑',
    title: 'Golden Warden',
    description: 'A radiant guardian who empowers allies with golden auras.',
    baseStats: { maxHp: 750, maxMana: 280, attack: 32, defense: 42, attackRange: 55, attackSpeed: 0.8, moveSpeed: 3.0, hpRegen: 5, manaRegen: 3 },
    growthPerLevel: { maxHp: 100, maxMana: 25, attack: 5, defense: 7 },
    abilities: [
      { id: 'golden_strike', name: 'Golden Strike', icon: '✊', manaCost: 35, cooldown: 5, range: 75, damage: 55, description: 'Strike with golden gauntlets, dealing damage.' },
      { id: 'aura', name: 'Radiant Aura', icon: '☀️', manaCost: 50, cooldown: 14, range: 0, damage: 0, healAmount: 120, effectRadius: 180, description: 'Emit a radiant aura healing and boosting nearby allies.' },
      { id: 'judgement', name: 'Final Judgement', icon: '⚖️', manaCost: 85, cooldown: 38, range: 100, damage: 200, effectRadius: 140, healAmount: 250, description: 'Ultimate: Pass judgement, dealing damage to enemies and healing allies in a large area.' },
    ],
  },
];

// ── Item Definitions ────────────────────────────────────────────
export const ITEMS: ItemDef[] = [
  // Tier 1 - Starter
  { id: 'short_blade', name: 'Short Blade', icon: '🔪', category: 'weapon', cost: 150, tier: 1, stats: { attack: 10 }, description: '+10 Attack' },
  { id: 'cloth_vest', name: 'Cloth Vest', icon: '🧥', category: 'armor', cost: 150, tier: 1, stats: { defense: 10 }, description: '+10 Defense' },
  { id: 'mana_crystal', name: 'Mana Crystal', icon: '💠', category: 'magic', cost: 150, tier: 1, stats: { maxMana: 80, manaRegen: 1 }, description: '+80 Mana, +1 Mana Regen' },
  { id: 'health_pendant', name: 'Health Pendant', icon: '📿', category: 'consumable', cost: 120, tier: 1, stats: { hpRegen: 4 }, description: '+4 HP Regen' },
  { id: 'leather_boots', name: 'Leather Boots', icon: '👢', category: 'boots', cost: 200, tier: 1, stats: { moveSpeed: 0.5 }, description: '+0.5 Move Speed' },
  // Tier 2 - Mid
  { id: 'steel_edge', name: 'Steel Edge', icon: '⚔️', category: 'weapon', cost: 500, tier: 2, stats: { attack: 25, attackSpeed: 0.15 }, description: '+25 Attack, +15% Attack Speed' },
  { id: 'chain_mail', name: 'Chain Mail', icon: '🛡️', category: 'armor', cost: 500, tier: 2, stats: { defense: 25, maxHp: 150 }, description: '+25 Defense, +150 HP' },
  { id: 'arcane_tome', name: 'Arcane Tome', icon: '📕', category: 'magic', cost: 550, tier: 2, stats: { attack: 20, maxMana: 150, manaRegen: 2 }, description: '+20 Attack, +150 Mana, +2 Mana Regen' },
  { id: 'swift_greaves', name: 'Swift Greaves', icon: '🥾', category: 'boots', cost: 450, tier: 2, stats: { moveSpeed: 1.0, attack: 10 }, description: '+1.0 Move Speed, +10 Attack' },
  { id: 'vitality_band', name: 'Vitality Band', icon: '💍', category: 'consumable', cost: 400, tier: 2, stats: { maxHp: 200, hpRegen: 5 }, description: '+200 HP, +5 HP Regen' },
  // Tier 3 - Legendary
  { id: 'tempest_blade', name: 'Tempest Blade', icon: '🌩️', category: 'weapon', cost: 1200, tier: 3, stats: { attack: 55, attackSpeed: 0.3, moveSpeed: 0.5 }, description: '+55 Attack, +30% Attack Speed, +0.5 Speed' },
  { id: 'fortress_plate', name: 'Fortress Plate', icon: '🏰', category: 'armor', cost: 1200, tier: 3, stats: { defense: 50, maxHp: 400, hpRegen: 8 }, description: '+50 Defense, +400 HP, +8 HP Regen' },
  { id: 'archmage_crown', name: 'Archmage Crown', icon: '👑', category: 'magic', cost: 1300, tier: 3, stats: { attack: 60, maxMana: 300, manaRegen: 5 }, description: '+60 Attack, +300 Mana, +5 Mana Regen' },
  { id: 'deathbringer', name: 'Deathbringer', icon: '💀', category: 'weapon', cost: 1500, tier: 3, stats: { attack: 80 }, description: '+80 Attack (raw power)' },
  { id: 'lifesteal_fang', name: 'Lifesteal Fang', icon: '🦷', category: 'weapon', cost: 1100, tier: 3, stats: { attack: 40, lifesteal: 0.15 }, description: '+40 Attack, 15% Lifesteal' },
  { id: 'guardian_wings', name: 'Guardian Wings', icon: '🪽', category: 'armor', cost: 1400, tier: 3, stats: { defense: 40, maxHp: 500, moveSpeed: 0.3 }, description: '+40 Defense, +500 HP, +0.3 Speed' },
];

// ── Map Configuration ───────────────────────────────────────────
export const MAP = {
  width: 3000,
  height: 900,
  laneY: 450,
  groundColor: '#1a2332',
  laneColor: '#2a3a4a',
  grassColor: '#1a3020',
};

export const BLUE_BASE: Position = { x: 120, y: 450 };
export const RED_BASE: Position = { x: 2880, y: 450 };
export const BLUE_TURRETS: Position[] = [{ x: 450, y: 450 }, { x: 800, y: 450 }];
export const RED_TURRETS: Position[] = [{ x: 2550, y: 450 }, { x: 2200, y: 450 }];
export const BLUE_SPAWNS: Position[] = [{ x: 200, y: 350 }, { x: 200, y: 450 }, { x: 200, y: 550 }];
export const RED_SPAWNS: Position[] = [{ x: 2800, y: 350 }, { x: 2800, y: 450 }, { x: 2800, y: 550 }];

// ── Brush Zones ─────────────────────────────────────────────────
export const BRUSH_ZONES: BrushZone[] = [
  { x: 1100, y: 200, width: 150, height: 120 },
  { x: 1100, y: 580, width: 150, height: 120 },
  { x: 1750, y: 200, width: 150, height: 120 },
  { x: 1750, y: 580, width: 150, height: 120 },
  { x: 1400, y: 100, width: 200, height: 100 },
  { x: 1400, y: 700, width: 200, height: 100 },
];

// ── Jungle Camp Positions ───────────────────────────────────────
export const JUNGLE_CAMPS = [
  { id: 'blue_wolves', x: 700, y: 200, team: 'blue' as const, buffType: 'mana' as const, icon: '🐺', name: 'Spirit Wolves', hp: 500, attack: 25, defense: 15 },
  { id: 'blue_sentinel', x: 700, y: 700, team: 'blue' as const, buffType: 'attack' as const, icon: '🔶', name: 'Flame Sentinel', hp: 600, attack: 30, defense: 20 },
  { id: 'red_wolves', x: 2300, y: 200, team: 'red' as const, buffType: 'mana' as const, icon: '🐺', name: 'Spirit Wolves', hp: 500, attack: 25, defense: 15 },
  { id: 'red_sentinel', x: 2300, y: 700, team: 'red' as const, buffType: 'attack' as const, icon: '🔶', name: 'Flame Sentinel', hp: 600, attack: 30, defense: 20 },
  { id: 'ancient_golem', x: 1500, y: 450, team: 'blue' as const, buffType: 'team' as const, icon: '🗿', name: 'Ancient Golem', hp: 1500, attack: 50, defense: 35 },
];

// ── Skin Definitions ────────────────────────────────────────────
export const SKINS: SkinDef[] = [
  { id: 'varen_crimson', heroId: 'varen', name: 'Crimson Knight', icon: '🔴', rarity: 'rare', price: 100, bodyColor: '#8B0000', borderColor: '#FF4444' },
  { id: 'varen_golden', heroId: 'varen', name: 'Golden Vanguard', icon: '🟡', rarity: 'epic', price: 250, bodyColor: '#8B6914', borderColor: '#FFD700' },
  { id: 'lyra_frost', heroId: 'lyra', name: 'Frost Fire', icon: '🔵', rarity: 'rare', price: 100, bodyColor: '#1a3a5a', borderColor: '#44BBFF' },
  { id: 'lyra_infernal', heroId: 'lyra', name: 'Infernal Queen', icon: '🟠', rarity: 'legendary', price: 500, bodyColor: '#5a1a0a', borderColor: '#FF6600' },
  { id: 'kael_shadow', heroId: 'kael', name: 'Shadow Archer', icon: '⚫', rarity: 'rare', price: 100, bodyColor: '#1a1a2a', borderColor: '#8844CC' },
  { id: 'kael_celestial', heroId: 'kael', name: 'Celestial Bow', icon: '⚪', rarity: 'epic', price: 250, bodyColor: '#2a2a4a', borderColor: '#AADDFF' },
  { id: 'borin_obsidian', heroId: 'borin', name: 'Obsidian Guard', icon: '🖤', rarity: 'epic', price: 250, bodyColor: '#0a0a0a', borderColor: '#666666' },
  { id: 'shade_bloodmoon', heroId: 'shade', name: 'Blood Moon', icon: '🔴', rarity: 'legendary', price: 500, bodyColor: '#3a0a0a', borderColor: '#CC0000' },
  { id: 'solara_aurora', heroId: 'solara', name: 'Aurora Healer', icon: '🟢', rarity: 'epic', price: 250, bodyColor: '#0a3a2a', borderColor: '#00FFAA' },
  { id: 'thane_frost', heroId: 'thane', name: 'Frost Berserker', icon: '🔵', rarity: 'rare', price: 100, bodyColor: '#0a2a4a', borderColor: '#4488FF' },
  { id: 'crysta_phoenix', heroId: 'crysta', name: 'Phoenix Ice', icon: '🟠', rarity: 'legendary', price: 500, bodyColor: '#3a1a0a', borderColor: '#FF8800' },
  { id: 'vesper_eclipse', heroId: 'vesper', name: 'Eclipse Hunter', icon: '🟣', rarity: 'epic', price: 250, bodyColor: '#1a0a3a', borderColor: '#AA44FF' },
  { id: 'tharros_jade', heroId: 'tharros', name: 'Jade Titan', icon: '🟢', rarity: 'rare', price: 100, bodyColor: '#0a2a1a', borderColor: '#44CC88' },
  { id: 'sera_divine', heroId: 'sera', name: 'Divine Aegis', icon: '⚪', rarity: 'epic', price: 250, bodyColor: '#3a3a1a', borderColor: '#FFDD44' },
  { id: 'auric_platinum', heroId: 'auric', name: 'Platinum Warden', icon: '⚪', rarity: 'legendary', price: 500, bodyColor: '#2a2a3a', borderColor: '#CCDDFF' },
];

// ── Quest Definitions ───────────────────────────────────────────
export const QUESTS: QuestDef[] = [
  { id: 'q_win2', title: 'Victor', description: 'Win 2 games', target: 2, reward: 100, type: 'wins' },
  { id: 'q_win3', title: 'Champion', description: 'Win 3 games', target: 3, reward: 180, type: 'wins' },
  { id: 'q_kills5', title: 'Slayer', description: 'Get 5 hero kills', target: 5, reward: 80, type: 'kills' },
  { id: 'q_kills10', title: 'Eliminator', description: 'Get 10 hero kills', target: 10, reward: 150, type: 'kills' },
  { id: 'q_play3', title: 'Dedicated', description: 'Play 3 games', target: 3, reward: 60, type: 'games' },
  { id: 'q_play5', title: 'Veteran', description: 'Play 5 games', target: 5, reward: 120, type: 'games' },
  { id: 'q_mage2', title: 'Spellcaster', description: 'Play 2 games as a Mage', target: 2, reward: 80, type: 'class_games', classRequirement: 'mage' },
  { id: 'q_tank2', title: 'Frontliner', description: 'Play 2 games as a Tank', target: 2, reward: 80, type: 'class_games', classRequirement: 'tank' },
  { id: 'q_assassin2', title: 'Shadow Ops', description: 'Play 2 games as an Assassin', target: 2, reward: 80, type: 'class_games', classRequirement: 'assassin' },
  { id: 'q_support2', title: 'Team Player', description: 'Play 2 games as Support', target: 2, reward: 80, type: 'class_games', classRequirement: 'support' },
];

// ── Battle Pass Tiers ───────────────────────────────────────────
export const BATTLE_PASS_TIERS: BattlePassTier[] = Array.from({ length: 30 }, (_, i) => {
  const tier = i + 1;
  const freeRewards: BattlePassTier['freeReward'][] = [
    { type: 'gold', amount: 50, label: '50 Gold' },
    { type: 'gold', amount: 100, label: '100 Gold' },
    { type: 'gold', amount: 75, label: '75 Gold' },
  ];
  const premiumRewards: BattlePassTier['premiumReward'][] = [
    { type: 'gems', amount: 20, label: '20 Gems' },
    { type: 'gold', amount: 200, label: '200 Gold' },
    { type: 'gems', amount: 50, label: '50 Gems' },
  ];
  // Special tiers
  if (tier === 5) return { tier, xpRequired: 200, freeReward: { type: 'gold', amount: 200, label: '200 Gold' }, premiumReward: { type: 'skin', id: 'varen_crimson', label: 'Crimson Knight Skin' } };
  if (tier === 10) return { tier, xpRequired: 200, freeReward: { type: 'hero', id: 'shade', label: 'Unlock Shade' }, premiumReward: { type: 'skin', id: 'lyra_frost', label: 'Frost Fire Skin' } };
  if (tier === 15) return { tier, xpRequired: 200, freeReward: { type: 'gold', amount: 500, label: '500 Gold' }, premiumReward: { type: 'skin', id: 'kael_celestial', label: 'Celestial Bow Skin' } };
  if (tier === 20) return { tier, xpRequired: 200, freeReward: { type: 'hero', id: 'vesper', label: 'Unlock Vesper' }, premiumReward: { type: 'skin', id: 'shade_bloodmoon', label: 'Blood Moon Skin' } };
  if (tier === 25) return { tier, xpRequired: 200, freeReward: { type: 'gold', amount: 800, label: '800 Gold' }, premiumReward: { type: 'skin', id: 'crysta_phoenix', label: 'Phoenix Ice Skin' } };
  if (tier === 30) return { tier, xpRequired: 200, freeReward: { type: 'gems', amount: 100, label: '100 Gems' }, premiumReward: { type: 'skin', id: 'auric_platinum', label: 'Platinum Warden Skin' } };
  return {
    tier,
    xpRequired: 200,
    freeReward: freeRewards[tier % 3],
    premiumReward: premiumRewards[tier % 3],
  };
});

// ── Ranked Divisions ────────────────────────────────────────────
export const RANKED_DIVISIONS: Record<RankedDivision, { name: string; icon: string; starsNeeded: number; color: string }> = {
  bronze: { name: 'Bronze', icon: '🥉', starsNeeded: 3, color: '#CD7F32' },
  silver: { name: 'Silver', icon: '🥈', starsNeeded: 3, color: '#C0C0C0' },
  gold: { name: 'Gold', icon: '🥇', starsNeeded: 4, color: '#FFD700' },
  platinum: { name: 'Platinum', icon: '💎', starsNeeded: 4, color: '#00CED1' },
  diamond: { name: 'Diamond', icon: '💠', starsNeeded: 5, color: '#B9F2FF' },
  master: { name: 'Master', icon: '🏆', starsNeeded: 5, color: '#FF6347' },
  grandmaster: { name: 'Grandmaster', icon: '👑', starsNeeded: 999, color: '#FFD700' },
};

// ── Tutorial Steps ──────────────────────────────────────────────
export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome', title: 'Welcome to Arena Battle!', message: 'This is a team battle game. Your goal is to destroy the enemy base. Let\'s learn the basics!', action: 'move' },
  { id: 'move', title: 'Movement', message: 'Use the joystick on the left to move your hero around the arena.', action: 'move' },
  { id: 'attack', title: 'Attack', message: 'Tap the sword button to auto-attack nearby enemies. Try attacking a minion!', action: 'attack' },
  { id: 'ability', title: 'Abilities', message: 'Your hero has 3 abilities. Tap an ability button to use it. Abilities cost mana and have cooldowns.', action: 'ability' },
  { id: 'shop', title: 'Item Shop', message: 'Earn gold by defeating enemies. Open the shop near your base to buy items that make you stronger!', action: 'shop' },
  { id: 'objective', title: 'Objectives', message: 'Destroy enemy turrets to push toward their base. Defeat jungle monsters for powerful buffs!', action: 'objective' },
  { id: 'complete', title: 'Ready for Battle!', message: 'You\'re ready! Destroy the enemy base to win. Good luck, hero!', action: 'complete' },
];

// ── Hero Unlock Costs ───────────────────────────────────────────
export const HERO_UNLOCK_COST: Record<string, number> = {
  varen: 0, lyra: 0, kael: 0, borin: 0,  // Free starter heroes
  shade: 800, solara: 800, thane: 800, crysta: 800,
  caelum: 1200, astra: 1200, tharros: 1200, vesper: 1200,
  sera: 1500, cindra: 1500, auric: 1500,
};

// ── Game Constants ──────────────────────────────────────────────
export const GAME = {
  TICK_RATE: 33,
  VIEWPORT_WIDTH: 600,
  VIEWPORT_HEIGHT: 400,
  MINION_SPAWN_INTERVAL: 25,
  MINION_WAVE_SIZE: 3,
  MINION_HP: 150,
  MINION_ATTACK: 15,
  MINION_DEFENSE: 5,
  MINION_SPEED: 2.0,
  MINION_RANGE: 50,
  MINION_SIZE: 14,
  TURRET_HP: 1200,
  TURRET_ATTACK: 80,
  TURRET_DEFENSE: 40,
  TURRET_RANGE: 200,
  TURRET_SPEED: 0.8,
  TURRET_SIZE: 30,
  BASE_HP: 2500,
  BASE_ATTACK: 60,
  BASE_DEFENSE: 50,
  BASE_RANGE: 180,
  BASE_SIZE: 45,
  XP_PER_MINION: 30,
  XP_PER_HERO_KILL: 150,
  XP_PER_JUNGLE: 80,
  GOLD_PER_MINION: 20,
  GOLD_PER_HERO_KILL: 300,
  GOLD_PER_TURRET: 150,
  GOLD_PER_JUNGLE: 60,
  RESPAWN_TIME_BASE: 5,
  RESPAWN_TIME_PER_LEVEL: 1,
  MAX_LEVEL: 15,
  XP_BASE: 100,
  XP_SCALE: 60,
  HERO_SIZE: 22,
  JUNGLE_SIZE: 24,
  PROJECTILE_SPEED: 8,
  KILL_FEED_DURATION: 5,
  ANNOUNCEMENT_DURATION: 3,
  PING_DURATION: 3,
  AI_DECISION_INTERVAL: 0.5,
  JUNGLE_RESPAWN_TIME: 60,
  MULTI_KILL_WINDOW: 8,
  MAX_ITEMS: 6,
  BUFF_ATTACK_DURATION: 30,
  BUFF_MANA_DURATION: 30,
  BUFF_TEAM_DURATION: 45,
};

// ── Colors ──────────────────────────────────────────────────────
export const GAME_COLORS = {
  blue: { primary: '#4488ff', light: '#6699ff', dark: '#2266cc', hp: '#44aaff' },
  red: { primary: '#ff4444', light: '#ff6666', dark: '#cc2222', hp: '#ff4444' },
  turret: { blue: '#5599dd', red: '#dd5555' },
  base: { blue: '#3377cc', red: '#cc3333' },
  minion: { blue: '#66aaee', red: '#ee6666' },
  hp: { high: '#44dd44', mid: '#ddaa22', low: '#dd4444' },
  mana: '#4488ff',
  xp: '#ddaa22',
  gold: '#ffcc00',
  map: { ground: '#1a2332', lane: '#2a3a4a', grass: '#1a3020', grid: '#222d3a' },
  ui: { bg: '#0a0e14', panel: '#151c28', border: '#2a3a4a', text: '#ddeeff', textDim: '#667788' },
  brush: '#1a4020',
  jungle: '#8B4513',
  ping: { attack: '#ff4444', retreat: '#44ff44', onMyWay: '#4488ff', danger: '#ffaa00' },
};

export function xpForLevel(level: number): number {
  return GAME.XP_BASE + (level - 1) * GAME.XP_SCALE;
}
