import {
  GameState,
  GameEntity,
  HeroEntity,
  TurretEntity,
  MinionEntity,
  BaseEntity,
  Projectile,
  GameInput,
  Team,
  HeroDef,
  KillFeedEntry,
} from './types';
import {
  HEROES,
  MAP,
  BLUE_BASE,
  RED_BASE,
  BLUE_TURRETS,
  RED_TURRETS,
  BLUE_SPAWNS,
  RED_SPAWNS,
  GAME,
  xpForLevel,
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

// ── Create Entities ───────────────────────────────────────────────

function createHero(
  heroDef: HeroDef,
  team: Team,
  spawn: { x: number; y: number },
  isPlayer: boolean
): HeroEntity {
  const s = heroDef.baseStats;
  return {
    id: nextId('hero'),
    type: 'hero',
    team,
    x: spawn.x,
    y: spawn.y,
    spawnX: spawn.x,
    spawnY: spawn.y,
    size: GAME.HERO_SIZE,
    hp: s.maxHp,
    maxHp: s.maxHp,
    attack: s.attack,
    defense: s.defense,
    attackRange: s.attackRange,
    attackSpeed: s.attackSpeed,
    attackTimer: 0,
    moveSpeed: s.moveSpeed,
    targetId: null,
    isDead: false,
    respawnTimer: 0,
    heroId: heroDef.id,
    heroClass: heroDef.class,
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    mana: s.maxMana,
    maxMana: s.maxMana,
    hpRegen: s.hpRegen,
    manaRegen: s.manaRegen,
    gold: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    abilities: heroDef.abilities.map((def) => ({
      def,
      cooldownRemaining: 0,
    })),
    isPlayer,
    lastDamagedBy: [],
  };
}

function createTurret(team: Team, pos: { x: number; y: number }, tier: number): TurretEntity {
  return {
    id: nextId('turret'),
    type: 'turret',
    team,
    x: pos.x,
    y: pos.y,
    spawnX: pos.x,
    spawnY: pos.y,
    size: GAME.TURRET_SIZE,
    hp: GAME.TURRET_HP,
    maxHp: GAME.TURRET_HP,
    attack: GAME.TURRET_ATTACK,
    defense: GAME.TURRET_DEFENSE,
    attackRange: GAME.TURRET_RANGE,
    attackSpeed: GAME.TURRET_SPEED,
    attackTimer: 0,
    moveSpeed: 0,
    targetId: null,
    isDead: false,
    respawnTimer: -1,
    tier,
  };
}

function createBase(team: Team, pos: { x: number; y: number }): BaseEntity {
  return {
    id: nextId('base'),
    type: 'base',
    team,
    x: pos.x,
    y: pos.y,
    spawnX: pos.x,
    spawnY: pos.y,
    size: GAME.BASE_SIZE,
    hp: GAME.BASE_HP,
    maxHp: GAME.BASE_HP,
    attack: GAME.BASE_ATTACK,
    defense: GAME.BASE_DEFENSE,
    attackRange: GAME.BASE_RANGE,
    attackSpeed: GAME.TURRET_SPEED,
    attackTimer: 0,
    moveSpeed: 0,
    targetId: null,
    isDead: false,
    respawnTimer: -1,
  };
}

function createMinion(team: Team, index: number): MinionEntity {
  const isBlue = team === 'blue';
  const basePos = isBlue ? BLUE_BASE : RED_BASE;
  const yOffset = (index - 1) * 30;
  return {
    id: nextId('minion'),
    type: 'minion',
    team,
    x: basePos.x + (isBlue ? 60 : -60),
    y: MAP.laneY + yOffset,
    spawnX: basePos.x,
    spawnY: MAP.laneY,
    size: GAME.MINION_SIZE,
    hp: GAME.MINION_HP,
    maxHp: GAME.MINION_HP,
    attack: GAME.MINION_ATTACK,
    defense: GAME.MINION_DEFENSE,
    attackRange: GAME.MINION_RANGE,
    attackSpeed: 1.0,
    attackTimer: 0,
    moveSpeed: GAME.MINION_SPEED,
    targetId: null,
    isDead: false,
    respawnTimer: -1,
    variant: index === 2 ? 'ranged' : 'melee',
    laneY: MAP.laneY + yOffset,
  };
}

// ── Initialize Game ───────────────────────────────────────────────

export function initGame(playerHeroId: string): GameState {
  entityIdCounter = 0;
  const entities: Record<string, GameEntity> = {};

  // Pick hero defs for all heroes
  const playerHeroDef = HEROES.find((h) => h.id === playerHeroId) || HEROES[0];

  // Available heroes for AI (excluding player's pick)
  const otherHeroes = HEROES.filter((h) => h.id !== playerHeroId);
  const shuffled = [...otherHeroes].sort(() => Math.random() - 0.5);

  // Blue team: player + 2 AI allies
  const blueHeroes = [playerHeroDef, shuffled[0], shuffled[1]];
  const redHeroes = [shuffled[2], shuffled[3], shuffled[4] || shuffled[0]];

  // Create blue team heroes
  blueHeroes.forEach((heroDef, i) => {
    const hero = createHero(heroDef, 'blue', BLUE_SPAWNS[i], i === 0);
    entities[hero.id] = hero;
  });

  // Create red team heroes
  redHeroes.forEach((heroDef, i) => {
    const hero = createHero(heroDef, 'red', RED_SPAWNS[i], false);
    entities[hero.id] = hero;
  });

  // Create turrets
  BLUE_TURRETS.forEach((pos, i) => {
    const turret = createTurret('blue', pos, i + 1);
    entities[turret.id] = turret;
  });
  RED_TURRETS.forEach((pos, i) => {
    const turret = createTurret('red', pos, i + 1);
    entities[turret.id] = turret;
  });

  // Create bases
  const blueBase = createBase('blue', BLUE_BASE);
  entities[blueBase.id] = blueBase;
  const redBase = createBase('red', RED_BASE);
  entities[redBase.id] = redBase;

  // Find player ID
  const playerId = Object.values(entities).find(
    (e) => e.type === 'hero' && (e as HeroEntity).isPlayer
  )!.id;

  return {
    entities,
    projectiles: [],
    playerId,
    gameTime: 0,
    isGameOver: false,
    winner: null,
    blueKills: 0,
    redKills: 0,
    nextMinionWave: 5,
    cameraX: entities[playerId].x,
    cameraY: entities[playerId].y,
    isPaused: false,
    killFeed: [],
  };
}

// ── Game Update ───────────────────────────────────────────────────

export function updateGame(state: GameState, dt: number, input: GameInput): GameState {
  if (state.isGameOver || state.isPaused) return state;

  const s = { ...state, entities: { ...state.entities } };
  s.gameTime += dt;

  // Clean expired kill feed entries
  s.killFeed = s.killFeed.filter(
    (entry) => s.gameTime - entry.timestamp < GAME.KILL_FEED_DURATION
  );

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
  const allEntities = Object.values(s.entities);

  for (const entity of allEntities) {
    if (entity.isDead) {
      handleDead(entity, s, dt);
      continue;
    }

    // Tick attack timer
    entity.attackTimer = Math.max(0, entity.attackTimer - dt);

    switch (entity.type) {
      case 'hero':
        updateHero(entity as HeroEntity, s, dt, input);
        break;
      case 'turret':
        updateTurret(entity as TurretEntity, s, dt);
        break;
      case 'minion':
        updateMinion(entity as MinionEntity, s, dt);
        break;
      case 'base':
        updateStructure(entity as BaseEntity, s, dt);
        break;
    }
  }

  // Update projectiles
  updateProjectiles(s, dt);

  // Update camera to follow player
  const player = s.entities[s.playerId] as HeroEntity;
  if (player) {
    s.cameraX = clamp(player.x, GAME.VIEWPORT_WIDTH / 2, MAP.width - GAME.VIEWPORT_WIDTH / 2);
    s.cameraY = clamp(player.y, GAME.VIEWPORT_HEIGHT / 2, MAP.height - GAME.VIEWPORT_HEIGHT / 2);
  }

  // Check win condition
  for (const entity of Object.values(s.entities)) {
    if (entity.type === 'base' && entity.isDead) {
      s.isGameOver = true;
      s.winner = entity.team === 'blue' ? 'red' : 'blue';
    }
  }

  return s;
}

// ── Hero Update ───────────────────────────────────────────────────

function updateHero(hero: HeroEntity, state: GameState, dt: number, input: GameInput): void {
  // Regeneration
  hero.hp = Math.min(hero.maxHp, hero.hp + hero.hpRegen * dt);
  hero.mana = Math.min(hero.maxMana, hero.mana + hero.manaRegen * dt);

  // Cooldowns
  for (const ability of hero.abilities) {
    ability.cooldownRemaining = Math.max(0, ability.cooldownRemaining - dt);
  }

  if (hero.isPlayer) {
    updatePlayerHero(hero, state, dt, input);
  } else {
    updateAIHero(hero, state, dt);
  }
}

function updatePlayerHero(
  hero: HeroEntity,
  state: GameState,
  dt: number,
  input: GameInput
): void {
  // Movement
  if (input.moveX !== 0 || input.moveY !== 0) {
    const mag = Math.sqrt(input.moveX * input.moveX + input.moveY * input.moveY);
    const nx = input.moveX / mag;
    const ny = input.moveY / mag;
    hero.x = clamp(hero.x + nx * hero.moveSpeed * dt * 60, hero.size, MAP.width - hero.size);
    hero.y = clamp(hero.y + ny * hero.moveSpeed * dt * 60, hero.size, MAP.height - hero.size);
  }

  // Ability use
  if (input.abilityIndex >= 0 && input.abilityIndex < hero.abilities.length) {
    useAbility(hero, input.abilityIndex, state);
  }

  // Auto-attack
  if (input.attackPressed || hero.targetId) {
    const target = findNearestEnemy(hero, state, hero.attackRange);
    if (target && hero.attackTimer <= 0) {
      performAttack(hero, target, state);
      hero.attackTimer = 1 / hero.attackSpeed;
    }
  }
}

function updateAIHero(hero: HeroEntity, state: GameState, dt: number): void {
  // Simple AI: find nearest enemy and attack, use abilities when available
  const enemies = Object.values(state.entities).filter(
    (e) => !e.isDead && e.team !== hero.team
  );

  if (enemies.length === 0) return;

  // Find nearest enemy hero or structure
  let target: GameEntity | null = null;
  let minDist = Infinity;

  // Prioritize: nearby enemy heroes > nearby minions > turrets > base
  for (const enemy of enemies) {
    const d = dist(hero.x, hero.y, enemy.x, enemy.y);
    const priority =
      enemy.type === 'hero' ? 0 :
      enemy.type === 'minion' ? 100 :
      enemy.type === 'turret' ? 200 : 300;
    const effective = d + priority;
    if (effective < minDist) {
      minDist = effective;
      target = enemy;
    }
  }

  if (!target) return;

  const d = dist(hero.x, hero.y, target.x, target.y);

  // Move toward target if out of range
  if (d > hero.attackRange * 0.8) {
    const dx = target.x - hero.x;
    const dy = target.y - hero.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      hero.x = clamp(
        hero.x + (dx / mag) * hero.moveSpeed * dt * 60,
        hero.size,
        MAP.width - hero.size
      );
      hero.y = clamp(
        hero.y + (dy / mag) * hero.moveSpeed * dt * 60,
        hero.size,
        MAP.height - hero.size
      );
    }
  }

  // Retreat if low health
  if (hero.hp < hero.maxHp * 0.2) {
    const basePos = hero.team === 'blue' ? BLUE_BASE : RED_BASE;
    const dx = basePos.x - hero.x;
    const dy = basePos.y - hero.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0) {
      hero.x += (dx / mag) * hero.moveSpeed * dt * 60;
      hero.y += (dy / mag) * hero.moveSpeed * dt * 60;
    }
    // Heal at base
    if (dist(hero.x, hero.y, basePos.x, basePos.y) < 100) {
      hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * 0.05 * dt);
      hero.mana = Math.min(hero.maxMana, hero.mana + hero.maxMana * 0.05 * dt);
    }
    return;
  }

  // Use abilities
  for (let i = hero.abilities.length - 1; i >= 0; i--) {
    const ability = hero.abilities[i];
    if (ability.cooldownRemaining <= 0 && hero.mana >= ability.def.manaCost && d < ability.def.range) {
      useAbility(hero, i, state);
      break;
    }
  }

  // Auto-attack
  if (d <= hero.attackRange && hero.attackTimer <= 0) {
    performAttack(hero, target, state);
    hero.attackTimer = 1 / hero.attackSpeed;
  }
}

// ── Turret / Structure Update ─────────────────────────────────────

function updateTurret(turret: TurretEntity, state: GameState, dt: number): void {
  updateStructure(turret, state, dt);
}

function updateStructure(structure: GameEntity, state: GameState, dt: number): void {
  // Find nearest enemy in range and attack
  const target = findNearestEnemy(structure, state, structure.attackRange);
  if (target && structure.attackTimer <= 0) {
    performAttack(structure, target, state);
    structure.attackTimer = 1 / structure.attackSpeed;
  }
}

// ── Minion Update ─────────────────────────────────────────────────

function updateMinion(minion: MinionEntity, state: GameState, dt: number): void {
  // Check for nearby enemies to attack
  const target = findNearestEnemy(minion, state, minion.attackRange);
  if (target) {
    if (minion.attackTimer <= 0) {
      performAttack(minion, target, state);
      minion.attackTimer = 1 / minion.attackSpeed;
    }
    return;
  }

  // March down the lane toward the enemy base
  const isBlue = minion.team === 'blue';
  const targetX = isBlue ? RED_BASE.x : BLUE_BASE.x;
  const dx = targetX - minion.x;
  const mag = Math.abs(dx);
  if (mag > 5) {
    minion.x += (dx / mag) * minion.moveSpeed * dt * 60;
  }

  // Slight Y correction to stay in lane
  const dy = minion.laneY - minion.y;
  if (Math.abs(dy) > 5) {
    minion.y += Math.sign(dy) * minion.moveSpeed * 0.5 * dt * 60;
  }
}

// ── Combat ────────────────────────────────────────────────────────

function findNearestEnemy(
  entity: GameEntity,
  state: GameState,
  range: number
): GameEntity | null {
  let nearest: GameEntity | null = null;
  let minD = range;

  // Prioritize: heroes being attacked by turret > minions > heroes > structures
  for (const other of Object.values(state.entities)) {
    if (other.isDead || other.team === entity.team) continue;
    const d = dist(entity.x, entity.y, other.x, other.y);
    if (d < minD) {
      minD = d;
      nearest = other;
    }
  }

  return nearest;
}

function performAttack(attacker: GameEntity, target: GameEntity, state: GameState): void {
  const dmg = calcDamage(attacker.attack, target.defense);

  // Ranged entities spawn projectiles, melee damage instantly
  const d = dist(attacker.x, attacker.y, target.x, target.y);
  if (d > 80 || attacker.type === 'turret' || attacker.type === 'base') {
    state.projectiles.push({
      id: nextId('proj'),
      team: attacker.team,
      x: attacker.x,
      y: attacker.y,
      targetId: target.id,
      damage: dmg,
      speed: GAME.PROJECTILE_SPEED,
      size: 5,
    });
  } else {
    applyDamage(target, dmg, attacker, state);
  }
}

function applyDamage(
  target: GameEntity,
  damage: number,
  attacker: GameEntity,
  state: GameState
): void {
  target.hp -= damage;

  // Track who damaged this entity (for assists)
  if (target.type === 'hero') {
    const hero = target as HeroEntity;
    if (!hero.lastDamagedBy.includes(attacker.id)) {
      hero.lastDamagedBy.push(attacker.id);
      if (hero.lastDamagedBy.length > 5) hero.lastDamagedBy.shift();
    }
  }

  if (target.hp <= 0) {
    target.hp = 0;
    target.isDead = true;

    if (target.type === 'hero') {
      const deadHero = target as HeroEntity;
      deadHero.deaths++;
      deadHero.respawnTimer =
        GAME.RESPAWN_TIME_BASE + deadHero.level * GAME.RESPAWN_TIME_PER_LEVEL;

      // Award kills and XP
      if (attacker.type === 'hero') {
        const killer = attacker as HeroEntity;
        killer.kills++;
        awardXP(killer, GAME.XP_PER_HERO_KILL);
        killer.gold += GAME.GOLD_PER_HERO_KILL;
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

      // Update kill counters
      if (deadHero.team === 'blue') state.redKills++;
      else state.blueKills++;

      // Kill feed
      const attackerName =
        attacker.type === 'hero'
          ? (attacker as HeroEntity).heroId
          : attacker.type === 'turret'
          ? 'Turret'
          : attacker.type;
      state.killFeed.push({
        killerId: attacker.id,
        killerName: attackerName,
        victimId: deadHero.id,
        victimName: deadHero.heroId,
        killerTeam: attacker.team,
        timestamp: state.gameTime,
      });
    }

    if (target.type === 'minion') {
      if (attacker.type === 'hero') {
        const killer = attacker as HeroEntity;
        awardXP(killer, GAME.XP_PER_MINION);
        killer.gold += GAME.GOLD_PER_MINION;
      }
    }

    if (target.type === 'turret') {
      if (attacker.type === 'hero') {
        const killer = attacker as HeroEntity;
        killer.gold += GAME.GOLD_PER_TURRET;
        awardXP(killer, GAME.XP_PER_HERO_KILL);
      }
    }
  }
}

function awardXP(hero: HeroEntity, amount: number): void {
  if (hero.level >= GAME.MAX_LEVEL) return;
  hero.xp += amount;
  while (hero.xp >= hero.xpToNext && hero.level < GAME.MAX_LEVEL) {
    hero.xp -= hero.xpToNext;
    hero.level++;
    hero.xpToNext = xpForLevel(hero.level);

    // Apply growth stats
    const heroDef = HEROES.find((h) => h.id === hero.heroId);
    if (heroDef) {
      const g = heroDef.growthPerLevel;
      hero.maxHp += g.maxHp;
      hero.hp += g.maxHp;
      hero.maxMana += g.maxMana;
      hero.mana += g.maxMana;
      hero.attack += g.attack;
      hero.defense += g.defense;
    }
  }
}

// ── Ability Use ───────────────────────────────────────────────────

function useAbility(hero: HeroEntity, abilityIndex: number, state: GameState): void {
  const ability = hero.abilities[abilityIndex];
  if (!ability || ability.cooldownRemaining > 0 || hero.mana < ability.def.manaCost) return;

  hero.mana -= ability.def.manaCost;
  ability.cooldownRemaining = ability.def.cooldown;

  // Healing abilities
  if (ability.def.healAmount && ability.def.healAmount > 0) {
    const radius = ability.def.effectRadius || 0;
    if (radius > 0) {
      // Area heal
      for (const entity of Object.values(state.entities)) {
        if (entity.isDead || entity.team !== hero.team || entity.type !== 'hero') continue;
        if (dist(hero.x, hero.y, entity.x, entity.y) <= radius) {
          entity.hp = Math.min(entity.maxHp, entity.hp + ability.def.healAmount!);
        }
      }
    } else {
      // Self heal
      hero.hp = Math.min(hero.maxHp, hero.hp + ability.def.healAmount!);
    }
  }

  // Damage abilities
  if (ability.def.damage > 0) {
    const radius = ability.def.effectRadius || 0;
    if (radius > 0) {
      // AoE damage
      for (const entity of Object.values(state.entities)) {
        if (entity.isDead || entity.team === hero.team) continue;
        if (dist(hero.x, hero.y, entity.x, entity.y) <= ability.def.range) {
          const dmg = calcDamage(ability.def.damage + hero.attack * 0.5, entity.defense);
          applyDamage(entity, dmg, hero, state);
        }
      }
    } else {
      // Single target - nearest enemy
      const target = findNearestEnemy(hero, state, ability.def.range);
      if (target) {
        const dmg = calcDamage(ability.def.damage + hero.attack * 0.5, target.defense);
        applyDamage(target, dmg, hero, state);
      }
    }
  }

  // Special: movement abilities (dash)
  if (ability.def.id === 'dash' || ability.def.id === 'shadow_step') {
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
}

// ── Projectile Update ─────────────────────────────────────────────

function updateProjectiles(state: GameState, dt: number): void {
  const remaining: Projectile[] = [];

  for (const proj of state.projectiles) {
    const target = state.entities[proj.targetId];
    if (!target || target.isDead) continue;

    const d = dist(proj.x, proj.y, target.x, target.y);
    if (d < target.size + proj.size) {
      // Hit!
      // Find the original attacker for damage tracking (approximate by team)
      const attackerEntity = Object.values(state.entities).find(
        (e) => e.team === proj.team && !e.isDead && (e.type === 'turret' || e.type === 'base' || e.type === 'hero')
      );
      applyDamage(target, proj.damage, attackerEntity || target, state);
      continue;
    }

    // Move toward target
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

// ── Dead Entity Handling ──────────────────────────────────────────

function handleDead(entity: GameEntity, state: GameState, dt: number): void {
  if (entity.type === 'hero') {
    const hero = entity as HeroEntity;
    hero.respawnTimer -= dt;
    if (hero.respawnTimer <= 0) {
      hero.isDead = false;
      hero.x = hero.spawnX;
      hero.y = hero.spawnY;
      hero.hp = hero.maxHp;
      hero.mana = hero.maxMana;
      hero.targetId = null;
      hero.lastDamagedBy = [];
    }
  }

  if (entity.type === 'minion') {
    // Remove dead minions from the game
    delete state.entities[entity.id];
  }
}

// ── Getters ───────────────────────────────────────────────────────

export function getPlayer(state: GameState): HeroEntity | null {
  return (state.entities[state.playerId] as HeroEntity) || null;
}

export function getHeroDef(heroId: string): HeroDef | undefined {
  return HEROES.find((h) => h.id === heroId);
}
