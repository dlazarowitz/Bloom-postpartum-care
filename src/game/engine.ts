import {
  GameState, GameEntity, HeroEntity, TurretEntity, MinionEntity,
  BaseEntity, JungleEntity, Projectile, GameInput, Team, HeroDef,
  DifficultyLevel, GameMode, Buff, AnnouncerEvent, PingEvent, DamageLogEntry,
} from './types';
import {
  HEROES, MAP, BLUE_BASE, RED_BASE, BLUE_TURRETS, RED_TURRETS,
  BLUE_SPAWNS, RED_SPAWNS, BRUSH_ZONES, JUNGLE_CAMPS, ITEMS, GAME, xpForLevel,
} from './data';

let entityIdCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}_${++entityIdCounter}`;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function calcDamage(rawAttack: number, defense: number): number {
  const reduction = defense / (defense + 100);
  return Math.max(1, Math.round(rawAttack * (1 - reduction)));
}

function isInBrush(x: number, y: number): boolean {
  for (const b of BRUSH_ZONES) {
    if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) return true;
  }
  return false;
}

function difficultyMultiplier(difficulty: DifficultyLevel, forEnemy: boolean): number {
  if (!forEnemy) return 1;
  switch (difficulty) {
    case 'easy': return 0.6;
    case 'normal': return 1.0;
    case 'hard': return 1.4;
  }
}

// ── Create Entities ─────────────────────────────────────────────

function createHero(heroDef: HeroDef, team: Team, spawn: { x: number; y: number }, isPlayer: boolean): HeroEntity {
  const s = heroDef.baseStats;
  return {
    id: nextId('hero'), type: 'hero', team, x: spawn.x, y: spawn.y,
    spawnX: spawn.x, spawnY: spawn.y, size: GAME.HERO_SIZE,
    hp: s.maxHp, maxHp: s.maxHp, attack: s.attack, defense: s.defense,
    attackRange: s.attackRange, attackSpeed: s.attackSpeed, attackTimer: 0,
    moveSpeed: s.moveSpeed, targetId: null, isDead: false, respawnTimer: 0,
    inBrush: false, heroId: heroDef.id, heroClass: heroDef.class,
    level: 1, xp: 0, xpToNext: xpForLevel(1),
    mana: s.maxMana, maxMana: s.maxMana, hpRegen: s.hpRegen, manaRegen: s.manaRegen,
    gold: 0, kills: 0, deaths: 0, assists: 0,
    abilities: heroDef.abilities.map((def) => ({ def, cooldownRemaining: 0 })),
    isPlayer, lastDamagedBy: [], items: [], skinId: null,
    damageLog: [], buffs: [], totalDamageDealt: 0,
    multiKillTimer: 0, multiKillCount: 0,
  };
}

function createTurret(team: Team, pos: { x: number; y: number }, tier: number): TurretEntity {
  return {
    id: nextId('turret'), type: 'turret', team, x: pos.x, y: pos.y,
    spawnX: pos.x, spawnY: pos.y, size: GAME.TURRET_SIZE,
    hp: GAME.TURRET_HP, maxHp: GAME.TURRET_HP, attack: GAME.TURRET_ATTACK,
    defense: GAME.TURRET_DEFENSE, attackRange: GAME.TURRET_RANGE,
    attackSpeed: GAME.TURRET_SPEED, attackTimer: 0, moveSpeed: 0,
    targetId: null, isDead: false, respawnTimer: -1, tier, inBrush: false,
  };
}

function createBase(team: Team, pos: { x: number; y: number }): BaseEntity {
  return {
    id: nextId('base'), type: 'base', team, x: pos.x, y: pos.y,
    spawnX: pos.x, spawnY: pos.y, size: GAME.BASE_SIZE,
    hp: GAME.BASE_HP, maxHp: GAME.BASE_HP, attack: GAME.BASE_ATTACK,
    defense: GAME.BASE_DEFENSE, attackRange: GAME.BASE_RANGE,
    attackSpeed: GAME.TURRET_SPEED, attackTimer: 0, moveSpeed: 0,
    targetId: null, isDead: false, respawnTimer: -1, inBrush: false,
  };
}

function createMinion(team: Team, index: number): MinionEntity {
  const isBlue = team === 'blue';
  const basePos = isBlue ? BLUE_BASE : RED_BASE;
  const yOffset = (index - 1) * 30;
  return {
    id: nextId('minion'), type: 'minion', team,
    x: basePos.x + (isBlue ? 60 : -60), y: MAP.laneY + yOffset,
    spawnX: basePos.x, spawnY: MAP.laneY, size: GAME.MINION_SIZE,
    hp: GAME.MINION_HP, maxHp: GAME.MINION_HP, attack: GAME.MINION_ATTACK,
    defense: GAME.MINION_DEFENSE, attackRange: GAME.MINION_RANGE,
    attackSpeed: 1.0, attackTimer: 0, moveSpeed: GAME.MINION_SPEED,
    targetId: null, isDead: false, respawnTimer: -1, inBrush: false,
    variant: index === 2 ? 'ranged' : 'melee', laneY: MAP.laneY + yOffset,
  };
}

function createJungleMonster(camp: typeof JUNGLE_CAMPS[0]): JungleEntity {
  return {
    id: nextId('jungle'), type: 'jungle', team: 'blue', // neutral, but typed as blue
    x: camp.x, y: camp.y, spawnX: camp.x, spawnY: camp.y,
    size: camp.buffType === 'team' ? 30 : GAME.JUNGLE_SIZE,
    hp: camp.hp, maxHp: camp.hp, attack: camp.attack, defense: camp.defense,
    attackRange: 60, attackSpeed: 0.8, attackTimer: 0, moveSpeed: 0,
    targetId: null, isDead: false, respawnTimer: -1, inBrush: false,
    campId: camp.id, buffType: camp.buffType, respawnDelay: GAME.JUNGLE_RESPAWN_TIME,
    respawnCountdown: 0, icon: camp.icon,
  };
}

// ── Initialize Game ─────────────────────────────────────────────

export function initGame(
  playerHeroId: string,
  mode: GameMode = 'quick',
  difficulty: DifficultyLevel = 'normal',
  skinId?: string | null,
): GameState {
  entityIdCounter = 0;
  const entities: Record<string, GameEntity> = {};

  const playerHeroDef = HEROES.find((h) => h.id === playerHeroId) || HEROES[0];
  const otherHeroes = HEROES.filter((h) => h.id !== playerHeroId);
  const shuffled = [...otherHeroes].sort(() => Math.random() - 0.5);

  const blueHeroes = [playerHeroDef, shuffled[0], shuffled[1]];
  const redHeroes = [shuffled[2], shuffled[3], shuffled[4] || shuffled[0]];

  let playerId = '';

  blueHeroes.forEach((heroDef, i) => {
    const hero = createHero(heroDef, 'blue', BLUE_SPAWNS[i], i === 0);
    if (i === 0) {
      hero.skinId = skinId || null;
      playerId = hero.id;
    }
    // Apply difficulty to AI allies
    if (!hero.isPlayer && difficulty === 'hard') {
      hero.attack = Math.round(hero.attack * 1.1);
    }
    entities[hero.id] = hero;
  });

  redHeroes.forEach((heroDef, i) => {
    const hero = createHero(heroDef, 'red', RED_SPAWNS[i], false);
    const mult = difficultyMultiplier(difficulty, true);
    hero.attack = Math.round(hero.attack * mult);
    hero.maxHp = Math.round(hero.maxHp * mult);
    hero.hp = hero.maxHp;
    hero.defense = Math.round(hero.defense * mult);
    entities[hero.id] = hero;
  });

  BLUE_TURRETS.forEach((pos, i) => { const t = createTurret('blue', pos, i + 1); entities[t.id] = t; });
  RED_TURRETS.forEach((pos, i) => { const t = createTurret('red', pos, i + 1); entities[t.id] = t; });
  const bb = createBase('blue', BLUE_BASE); entities[bb.id] = bb;
  const rb = createBase('red', RED_BASE); entities[rb.id] = rb;

  // Jungle monsters
  JUNGLE_CAMPS.forEach((camp) => {
    const jm = createJungleMonster(camp);
    entities[jm.id] = jm;
  });

  return {
    entities, projectiles: [], playerId, gameTime: 0,
    isGameOver: false, winner: null, blueKills: 0, redKills: 0,
    nextMinionWave: 5, cameraX: entities[playerId].x, cameraY: entities[playerId].y,
    isPaused: false, killFeed: [], brushZones: BRUSH_ZONES,
    announcements: [], pings: [], gameMode: mode, difficulty, firstBlood: false,
  };
}

// ── Main Update ─────────────────────────────────────────────────

export function updateGame(state: GameState, dt: number, input: GameInput): GameState {
  if (state.isGameOver || state.isPaused) return state;

  const s = { ...state, entities: { ...state.entities } };
  s.gameTime += dt;

  // Clean expired entries
  s.killFeed = s.killFeed.filter((e) => s.gameTime - e.timestamp < GAME.KILL_FEED_DURATION);
  s.announcements = s.announcements.filter((e) => s.gameTime - e.timestamp < GAME.ANNOUNCEMENT_DURATION);
  s.pings = s.pings.filter((e) => s.gameTime - e.timestamp < GAME.PING_DURATION);

  // Handle pings
  if (input.pingType) {
    const player = s.entities[s.playerId] as HeroEntity;
    if (player && !player.isDead) {
      s.pings.push({ type: input.pingType, x: player.x, y: player.y, timestamp: s.gameTime });
    }
  }

  // Handle item purchase
  if (input.buyItemId) {
    buyItem(s, input.buyItemId);
  }

  // Spawn minion waves
  if (s.gameTime >= s.nextMinionWave) {
    s.nextMinionWave += GAME.MINION_SPAWN_INTERVAL;
    for (let i = 0; i < GAME.MINION_WAVE_SIZE; i++) {
      const bm = createMinion('blue', i);
      s.entities[bm.id] = bm;
      const rm = createMinion('red', i);
      s.entities[rm.id] = rm;
    }
  }

  // Update all entities
  for (const entity of Object.values(s.entities)) {
    if (entity.isDead) { handleDead(entity, s, dt); continue; }
    entity.attackTimer = Math.max(0, entity.attackTimer - dt);
    entity.inBrush = isInBrush(entity.x, entity.y);

    switch (entity.type) {
      case 'hero': updateHero(entity as HeroEntity, s, dt, input); break;
      case 'turret': updateStructure(entity, s, dt); break;
      case 'minion': updateMinion(entity as MinionEntity, s, dt); break;
      case 'base': updateStructure(entity, s, dt); break;
      case 'jungle': updateJungle(entity as JungleEntity, s, dt); break;
    }
  }

  updateProjectiles(s, dt);

  // Camera
  const player = s.entities[s.playerId] as HeroEntity;
  if (player) {
    s.cameraX = clamp(player.x, GAME.VIEWPORT_WIDTH / 2, MAP.width - GAME.VIEWPORT_WIDTH / 2);
    s.cameraY = clamp(player.y, GAME.VIEWPORT_HEIGHT / 2, MAP.height - GAME.VIEWPORT_HEIGHT / 2);
  }

  // Win condition
  for (const entity of Object.values(s.entities)) {
    if (entity.type === 'base' && entity.isDead) {
      s.isGameOver = true;
      s.winner = entity.team === 'blue' ? 'red' : 'blue';
      addAnnouncement(s, s.winner === 'blue' ? 'VICTORY!' : 'DEFEAT!',
        s.winner === 'blue' ? '#4488ff' : '#ff4444');
    }
  }

  return s;
}

// ── Hero Update ─────────────────────────────────────────────────

function updateHero(hero: HeroEntity, state: GameState, dt: number, input: GameInput): void {
  // Regen
  const buffStats = getBuffStats(hero);
  hero.hp = Math.min(hero.maxHp, hero.hp + (hero.hpRegen + (buffStats.hpRegen || 0)) * dt);
  hero.mana = Math.min(hero.maxMana, hero.mana + (hero.manaRegen + (buffStats.manaRegen || 0)) * dt);

  // Cooldowns
  for (const ability of hero.abilities) {
    ability.cooldownRemaining = Math.max(0, ability.cooldownRemaining - dt);
  }

  // Buff timers
  hero.buffs = hero.buffs.filter((b) => {
    b.remaining -= dt;
    return b.remaining > 0;
  });

  // Multi-kill timer
  if (hero.multiKillTimer > 0) {
    hero.multiKillTimer -= dt;
    if (hero.multiKillTimer <= 0) hero.multiKillCount = 0;
  }

  // Base healing
  const basePos = hero.team === 'blue' ? BLUE_BASE : RED_BASE;
  if (dist(hero.x, hero.y, basePos.x, basePos.y) < 120) {
    hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * 0.03 * dt);
    hero.mana = Math.min(hero.maxMana, hero.mana + hero.maxMana * 0.03 * dt);
  }

  if (hero.isPlayer) {
    updatePlayerHero(hero, state, dt, input);
  } else {
    updateAIHero(hero, state, dt);
  }
}

function updatePlayerHero(hero: HeroEntity, state: GameState, dt: number, input: GameInput): void {
  if (input.moveX !== 0 || input.moveY !== 0) {
    const mag = Math.sqrt(input.moveX * input.moveX + input.moveY * input.moveY);
    const buffStats = getBuffStats(hero);
    const speed = hero.moveSpeed + (buffStats.moveSpeed || 0);
    const nx = input.moveX / mag;
    const ny = input.moveY / mag;
    hero.x = clamp(hero.x + nx * speed * dt * 60, hero.size, MAP.width - hero.size);
    hero.y = clamp(hero.y + ny * speed * dt * 60, hero.size, MAP.height - hero.size);
  }

  if (input.abilityIndex >= 0 && input.abilityIndex < hero.abilities.length) {
    useAbility(hero, input.abilityIndex, state);
  }

  if (input.attackPressed || hero.targetId) {
    const target = findNearestEnemy(hero, state, hero.attackRange);
    if (target && hero.attackTimer <= 0) {
      performAttack(hero, target, state);
      hero.attackTimer = 1 / hero.attackSpeed;
    }
  }
}

function updateAIHero(hero: HeroEntity, state: GameState, dt: number): void {
  const enemies = Object.values(state.entities).filter((e) => !e.isDead && e.team !== hero.team && e.type !== 'jungle');
  if (enemies.length === 0) return;

  let target: GameEntity | null = null;
  let minDist = Infinity;

  for (const enemy of enemies) {
    const d = dist(hero.x, hero.y, enemy.x, enemy.y);
    const priority = enemy.type === 'hero' ? 0 : enemy.type === 'minion' ? 100 : enemy.type === 'turret' ? 200 : 300;
    const effective = d + priority;
    if (effective < minDist) { minDist = effective; target = enemy; }
  }

  if (!target) return;
  const d = dist(hero.x, hero.y, target.x, target.y);

  // Retreat if low HP
  if (hero.hp < hero.maxHp * 0.2) {
    const bp = hero.team === 'blue' ? BLUE_BASE : RED_BASE;
    const dx = bp.x - hero.x;
    const dy = bp.y - hero.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      hero.x += (dx / mag) * hero.moveSpeed * dt * 60;
      hero.y += (dy / mag) * hero.moveSpeed * dt * 60;
    }
    return;
  }

  // Move toward target
  if (d > hero.attackRange * 0.8) {
    const dx = target.x - hero.x;
    const dy = target.y - hero.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      hero.x = clamp(hero.x + (dx / mag) * hero.moveSpeed * dt * 60, hero.size, MAP.width - hero.size);
      hero.y = clamp(hero.y + (dy / mag) * hero.moveSpeed * dt * 60, hero.size, MAP.height - hero.size);
    }
  }

  // AI ability usage (smarter based on difficulty)
  const abilityChance = state.difficulty === 'hard' ? 1.0 : state.difficulty === 'normal' ? 0.7 : 0.4;
  if (Math.random() < abilityChance) {
    for (let i = hero.abilities.length - 1; i >= 0; i--) {
      const a = hero.abilities[i];
      if (a.cooldownRemaining <= 0 && hero.mana >= a.def.manaCost && d < a.def.range) {
        useAbility(hero, i, state);
        break;
      }
    }
  }

  // Auto-attack
  if (d <= hero.attackRange && hero.attackTimer <= 0) {
    performAttack(hero, target, state);
    hero.attackTimer = 1 / hero.attackSpeed;
  }
}

// ── Structure / Minion / Jungle ─────────────────────────────────

function updateStructure(structure: GameEntity, state: GameState, dt: number): void {
  const target = findNearestEnemy(structure, state, structure.attackRange);
  if (target && structure.attackTimer <= 0) {
    performAttack(structure, target, state);
    structure.attackTimer = 1 / structure.attackSpeed;
  }
}

function updateMinion(minion: MinionEntity, state: GameState, dt: number): void {
  const target = findNearestEnemy(minion, state, minion.attackRange);
  if (target) {
    if (minion.attackTimer <= 0) {
      performAttack(minion, target, state);
      minion.attackTimer = 1 / minion.attackSpeed;
    }
    return;
  }
  const isBlue = minion.team === 'blue';
  const targetX = isBlue ? RED_BASE.x : BLUE_BASE.x;
  const dx = targetX - minion.x;
  if (Math.abs(dx) > 5) minion.x += Math.sign(dx) * minion.moveSpeed * dt * 60;
  const dy = minion.laneY - minion.y;
  if (Math.abs(dy) > 5) minion.y += Math.sign(dy) * minion.moveSpeed * 0.5 * dt * 60;
}

function updateJungle(jungle: JungleEntity, state: GameState, dt: number): void {
  if (jungle.isDead) return;
  // Attack anyone attacking it
  const target = findNearestEnemy(jungle, state, jungle.attackRange, true);
  if (target && jungle.attackTimer <= 0) {
    performAttack(jungle, target, state);
    jungle.attackTimer = 1 / jungle.attackSpeed;
  }
}

// ── Combat ──────────────────────────────────────────────────────

function findNearestEnemy(entity: GameEntity, state: GameState, range: number, anyTeam?: boolean): GameEntity | null {
  let nearest: GameEntity | null = null;
  let minD = range;
  for (const other of Object.values(state.entities)) {
    if (other.isDead) continue;
    if (!anyTeam && other.team === entity.team) continue;
    if (anyTeam && other.type === 'jungle') continue; // jungle doesn't attack jungle
    if (entity.type === 'jungle' && other.type !== 'hero') continue; // jungle only attacks heroes
    const d = dist(entity.x, entity.y, other.x, other.y);
    // Skip entities hidden in brush (unless attacker is also in brush or same brush)
    if (other.inBrush && !entity.inBrush && entity.type !== 'turret' && entity.type !== 'base') continue;
    if (d < minD) { minD = d; nearest = other; }
  }
  return nearest;
}

function performAttack(attacker: GameEntity, target: GameEntity, state: GameState): void {
  const buffStats = attacker.type === 'hero' ? getBuffStats(attacker as HeroEntity) : { attack: 0 };
  const totalAttack = attacker.attack + (buffStats.attack || 0);
  const dmg = calcDamage(totalAttack, target.defense);
  const d = dist(attacker.x, attacker.y, target.x, target.y);

  if (d > 80 || attacker.type === 'turret' || attacker.type === 'base') {
    state.projectiles.push({
      id: nextId('proj'), team: attacker.team,
      x: attacker.x, y: attacker.y, targetId: target.id,
      damage: dmg, speed: GAME.PROJECTILE_SPEED, size: 5,
      sourceId: attacker.id,
    });
  } else {
    applyDamage(target, dmg, attacker, state);
    // Lifesteal
    if (attacker.type === 'hero') {
      const hero = attacker as HeroEntity;
      const lifesteal = getItemStat(hero, 'lifesteal');
      if (lifesteal > 0) {
        hero.hp = Math.min(hero.maxHp, hero.hp + dmg * lifesteal);
      }
    }
  }
}

function applyDamage(target: GameEntity, damage: number, attacker: GameEntity, state: GameState, abilityName?: string): void {
  target.hp -= damage;

  // Track damage for death recap
  if (target.type === 'hero') {
    const hero = target as HeroEntity;
    const sourceName = attacker.type === 'hero'
      ? (attacker as HeroEntity).heroId
      : attacker.type === 'turret' ? 'Turret'
      : attacker.type === 'jungle' ? (attacker as JungleEntity).icon
      : attacker.type;
    hero.damageLog.push({
      sourceId: attacker.id, sourceName, damage, timestamp: state.gameTime, abilityName,
    });
    if (hero.damageLog.length > 20) hero.damageLog.shift();
    if (!hero.lastDamagedBy.includes(attacker.id)) {
      hero.lastDamagedBy.push(attacker.id);
      if (hero.lastDamagedBy.length > 5) hero.lastDamagedBy.shift();
    }
  }

  // Track damage dealt
  if (attacker.type === 'hero') {
    (attacker as HeroEntity).totalDamageDealt += damage;
  }

  if (target.hp <= 0) {
    target.hp = 0;
    target.isDead = true;
    handleKill(target, attacker, state);
  }
}

function handleKill(target: GameEntity, attacker: GameEntity, state: GameState): void {
  if (target.type === 'hero') {
    const deadHero = target as HeroEntity;
    deadHero.deaths++;
    deadHero.respawnTimer = GAME.RESPAWN_TIME_BASE + deadHero.level * GAME.RESPAWN_TIME_PER_LEVEL;

    if (attacker.type === 'hero') {
      const killer = attacker as HeroEntity;
      killer.kills++;
      awardXP(killer, GAME.XP_PER_HERO_KILL);
      killer.gold += GAME.GOLD_PER_HERO_KILL;

      // Multi-kill tracking
      killer.multiKillCount++;
      killer.multiKillTimer = GAME.MULTI_KILL_WINDOW;
      if (killer.multiKillCount === 2) addAnnouncement(state, 'DOUBLE KILL!', '#ffaa00');
      else if (killer.multiKillCount === 3) addAnnouncement(state, 'TRIPLE KILL!', '#ff6600');
      else if (killer.multiKillCount >= 4) addAnnouncement(state, 'LEGENDARY!', '#ff0000');
    }

    // First blood
    if (!state.firstBlood) {
      state.firstBlood = true;
      addAnnouncement(state, 'FIRST BLOOD!', '#ff4444');
    }

    // Assists
    for (const id of deadHero.lastDamagedBy) {
      if (id !== attacker.id) {
        const assister = state.entities[id];
        if (assister && assister.type === 'hero') {
          (assister as HeroEntity).assists++;
          awardXP(assister as HeroEntity, Math.floor(GAME.XP_PER_HERO_KILL * 0.5));
          (assister as HeroEntity).gold += Math.floor(GAME.GOLD_PER_HERO_KILL * 0.3);
        }
      }
    }
    deadHero.lastDamagedBy = [];
    deadHero.damageLog = [];

    if (deadHero.team === 'blue') state.redKills++;
    else state.blueKills++;

    // Check ACE
    const aliveOnTeam = Object.values(state.entities).filter(
      (e) => e.type === 'hero' && e.team === deadHero.team && !e.isDead
    );
    if (aliveOnTeam.length === 0) addAnnouncement(state, 'ACE!', '#ffdd00');

    // Kill feed
    const attackerName = attacker.type === 'hero' ? (attacker as HeroEntity).heroId : attacker.type;
    state.killFeed.push({
      killerId: attacker.id, killerName: attackerName,
      victimId: deadHero.id, victimName: deadHero.heroId,
      killerTeam: attacker.team, timestamp: state.gameTime,
    });
  }

  if (target.type === 'minion' && attacker.type === 'hero') {
    const killer = attacker as HeroEntity;
    awardXP(killer, GAME.XP_PER_MINION);
    killer.gold += GAME.GOLD_PER_MINION;
  }

  if (target.type === 'turret') {
    addAnnouncement(state, `${target.team === 'blue' ? 'Blue' : 'Red'} turret destroyed!`, '#ffaa00');
    if (attacker.type === 'hero') {
      const killer = attacker as HeroEntity;
      killer.gold += GAME.GOLD_PER_TURRET;
      awardXP(killer, GAME.XP_PER_HERO_KILL);
    }
  }

  if (target.type === 'jungle') {
    const jungle = target as JungleEntity;
    if (attacker.type === 'hero') {
      const killer = attacker as HeroEntity;
      awardXP(killer, GAME.XP_PER_JUNGLE);
      killer.gold += GAME.GOLD_PER_JUNGLE;
      applyJungleBuff(killer, jungle, state);
    }
  }
}

// ── Jungle Buffs ────────────────────────────────────────────────

function applyJungleBuff(hero: HeroEntity, jungle: JungleEntity, state: GameState): void {
  const existing = hero.buffs.findIndex((b) => b.id === jungle.buffType);
  if (existing >= 0) hero.buffs.splice(existing, 1);

  switch (jungle.buffType) {
    case 'attack':
      hero.buffs.push({
        id: 'attack', name: 'Flame Buff', icon: '🔶',
        duration: GAME.BUFF_ATTACK_DURATION, remaining: GAME.BUFF_ATTACK_DURATION,
        stats: { attack: 20 },
      });
      addAnnouncement(state, `${hero.heroId} gained Flame Buff!`, '#ff8800');
      break;
    case 'mana':
      hero.buffs.push({
        id: 'mana', name: 'Spirit Buff', icon: '🐺',
        duration: GAME.BUFF_MANA_DURATION, remaining: GAME.BUFF_MANA_DURATION,
        stats: { manaRegen: 5 },
      });
      addAnnouncement(state, `${hero.heroId} gained Spirit Buff!`, '#4488ff');
      break;
    case 'team':
      // Buff all allies
      for (const e of Object.values(state.entities)) {
        if (e.type === 'hero' && e.team === hero.team && !e.isDead) {
          const ally = e as HeroEntity;
          const idx = ally.buffs.findIndex((b) => b.id === 'team');
          if (idx >= 0) ally.buffs.splice(idx, 1);
          ally.buffs.push({
            id: 'team', name: 'Ancient Power', icon: '🗿',
            duration: GAME.BUFF_TEAM_DURATION, remaining: GAME.BUFF_TEAM_DURATION,
            stats: { attack: 15, defense: 10, moveSpeed: 0.3 },
          });
        }
      }
      addAnnouncement(state, `${hero.team === 'blue' ? 'Blue' : 'Red'} team slayed the Ancient Golem!`, '#ffdd00');
      break;
  }
}

// ── Item System ─────────────────────────────────────────────────

function buyItem(state: GameState, itemId: string): void {
  const player = state.entities[state.playerId] as HeroEntity;
  if (!player || player.isDead) return;

  const item = ITEMS.find((i) => i.id === itemId);
  if (!item) return;
  if (player.items.length >= GAME.MAX_ITEMS) return;
  if (player.gold < item.cost) return;

  // Must be near base to shop
  const basePos = player.team === 'blue' ? BLUE_BASE : RED_BASE;
  if (dist(player.x, player.y, basePos.x, basePos.y) > 200) return;

  player.gold -= item.cost;
  player.items.push(itemId);

  // Apply stats
  if (item.stats.attack) player.attack += item.stats.attack;
  if (item.stats.defense) player.defense += item.stats.defense;
  if (item.stats.maxHp) { player.maxHp += item.stats.maxHp; player.hp += item.stats.maxHp; }
  if (item.stats.maxMana) { player.maxMana += item.stats.maxMana; player.mana += item.stats.maxMana; }
  if (item.stats.moveSpeed) player.moveSpeed += item.stats.moveSpeed;
  if (item.stats.attackSpeed) player.attackSpeed += item.stats.attackSpeed;
  if (item.stats.hpRegen) player.hpRegen += item.stats.hpRegen;
  if (item.stats.manaRegen) player.manaRegen += item.stats.manaRegen;
}

function getItemStat(hero: HeroEntity, stat: string): number {
  let total = 0;
  for (const itemId of hero.items) {
    const item = ITEMS.find((i) => i.id === itemId);
    if (item && (item.stats as any)[stat]) total += (item.stats as any)[stat];
  }
  return total;
}

function getBuffStats(hero: HeroEntity): Record<string, number> {
  const result: Record<string, number> = {};
  for (const buff of hero.buffs) {
    for (const [key, val] of Object.entries(buff.stats)) {
      if (val) result[key] = (result[key] || 0) + val;
    }
  }
  return result;
}

// ── Ability Use ─────────────────────────────────────────────────

function useAbility(hero: HeroEntity, abilityIndex: number, state: GameState): void {
  const ability = hero.abilities[abilityIndex];
  if (!ability || ability.cooldownRemaining > 0 || hero.mana < ability.def.manaCost) return;

  hero.mana -= ability.def.manaCost;
  ability.cooldownRemaining = ability.def.cooldown;

  // Healing
  if (ability.def.healAmount && ability.def.healAmount > 0) {
    const radius = ability.def.effectRadius || 0;
    if (radius > 0) {
      for (const entity of Object.values(state.entities)) {
        if (entity.isDead || entity.team !== hero.team || entity.type !== 'hero') continue;
        if (dist(hero.x, hero.y, entity.x, entity.y) <= radius) {
          entity.hp = Math.min(entity.maxHp, entity.hp + ability.def.healAmount!);
        }
      }
    } else {
      hero.hp = Math.min(hero.maxHp, hero.hp + ability.def.healAmount!);
    }
  }

  // Damage
  if (ability.def.damage > 0) {
    const radius = ability.def.effectRadius || 0;
    if (radius > 0) {
      for (const entity of Object.values(state.entities)) {
        if (entity.isDead || entity.team === hero.team) continue;
        if (dist(hero.x, hero.y, entity.x, entity.y) <= ability.def.range) {
          const dmg = calcDamage(ability.def.damage + hero.attack * 0.5, entity.defense);
          applyDamage(entity, dmg, hero, state, ability.def.name);
        }
      }
    } else {
      const target = findNearestEnemy(hero, state, ability.def.range);
      if (target) {
        const dmg = calcDamage(ability.def.damage + hero.attack * 0.5, target.defense);
        applyDamage(target, dmg, hero, state, ability.def.name);
      }
    }
  }

  // Dash / teleport abilities
  if (ability.def.id === 'dash' || ability.def.id === 'shadow_step' || ability.def.id === 'night_strike' || ability.def.id === 'cleave') {
    const target = findNearestEnemy(hero, state, ability.def.range);
    if (target) {
      const d = dist(hero.x, hero.y, target.x, target.y);
      if (d > 0) {
        const dx = target.x - hero.x;
        const dy = target.y - hero.y;
        hero.x = target.x - (dx / d) * (target.size + hero.size);
        hero.y = target.y - (dy / d) * (target.size + hero.size);
        hero.x = clamp(hero.x, hero.size, MAP.width - hero.size);
        hero.y = clamp(hero.y, hero.size, MAP.height - hero.size);
      }
    }
  }

  // Self-buff abilities
  if (ability.def.id === 'frenzy') {
    hero.buffs.push({
      id: 'frenzy', name: 'Battle Frenzy', icon: '😤',
      duration: 6, remaining: 6,
      stats: { attack: 15, moveSpeed: 0.5 },
    });
  }
}

// ── Announcements ───────────────────────────────────────────────

function addAnnouncement(state: GameState, text: string, color: string): void {
  state.announcements.push({ text, color, timestamp: state.gameTime });
}

// ── XP / Level ──────────────────────────────────────────────────

function awardXP(hero: HeroEntity, amount: number): void {
  if (hero.level >= GAME.MAX_LEVEL) return;
  hero.xp += amount;
  while (hero.xp >= hero.xpToNext && hero.level < GAME.MAX_LEVEL) {
    hero.xp -= hero.xpToNext;
    hero.level++;
    hero.xpToNext = xpForLevel(hero.level);
    const heroDef = HEROES.find((h) => h.id === hero.heroId);
    if (heroDef) {
      const g = heroDef.growthPerLevel;
      hero.maxHp += g.maxHp; hero.hp += g.maxHp;
      hero.maxMana += g.maxMana; hero.mana += g.maxMana;
      hero.attack += g.attack; hero.defense += g.defense;
    }
  }
}

// ── Projectiles ─────────────────────────────────────────────────

function updateProjectiles(state: GameState, dt: number): void {
  const remaining: Projectile[] = [];
  for (const proj of state.projectiles) {
    const target = state.entities[proj.targetId];
    if (!target || target.isDead) continue;
    const d = dist(proj.x, proj.y, target.x, target.y);
    if (d < target.size + proj.size) {
      const attacker = state.entities[proj.sourceId];
      applyDamage(target, proj.damage, attacker || target, state, proj.abilityName);
      // Lifesteal on projectile hit
      if (attacker && attacker.type === 'hero') {
        const ls = getItemStat(attacker as HeroEntity, 'lifesteal');
        if (ls > 0) attacker.hp = Math.min(attacker.maxHp, attacker.hp + proj.damage * ls);
      }
      continue;
    }
    const dx = target.x - proj.x;
    const dy = target.y - proj.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      proj.x += (dx / mag) * proj.speed * dt * 60;
      proj.y += (dy / mag) * proj.speed * dt * 60;
    }
    remaining.push(proj);
  }
  state.projectiles = remaining;
}

// ── Dead Entity Handling ────────────────────────────────────────

function handleDead(entity: GameEntity, state: GameState, dt: number): void {
  if (entity.type === 'hero') {
    const hero = entity as HeroEntity;
    hero.respawnTimer -= dt;
    if (hero.respawnTimer <= 0) {
      hero.isDead = false;
      hero.x = hero.spawnX; hero.y = hero.spawnY;
      hero.hp = hero.maxHp; hero.mana = hero.maxMana;
      hero.targetId = null; hero.lastDamagedBy = []; hero.damageLog = [];
    }
  }
  if (entity.type === 'minion') {
    delete state.entities[entity.id];
  }
  if (entity.type === 'jungle') {
    const jungle = entity as JungleEntity;
    jungle.respawnCountdown += dt;
    if (jungle.respawnCountdown >= jungle.respawnDelay) {
      jungle.isDead = false;
      jungle.hp = jungle.maxHp;
      jungle.respawnCountdown = 0;
    }
  }
}

// ── Getters ─────────────────────────────────────────────────────

export function getPlayer(state: GameState): HeroEntity | null {
  return (state.entities[state.playerId] as HeroEntity) || null;
}

export function getHeroDef(heroId: string): HeroDef | undefined {
  return HEROES.find((h) => h.id === heroId);
}

export function isNearBase(state: GameState): boolean {
  const player = state.entities[state.playerId] as HeroEntity;
  if (!player) return false;
  const basePos = player.team === 'blue' ? BLUE_BASE : RED_BASE;
  return dist(player.x, player.y, basePos.x, basePos.y) < 200;
}
