import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GameState,
  GameInput,
  HeroEntity,
  RenderEntity,
} from '../../src/game/types';
import { initGame, updateGame, getPlayer, getHeroDef } from '../../src/game/engine';
import { MAP, GAME, GAME_COLORS, HEROES } from '../../src/game/data';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const VIEWPORT_W = SCREEN_W;
const VIEWPORT_H = SCREEN_H - 160; // leave room for controls

// ── Main Game Screen ──────────────────────────────────────────────

export default function GamePlayScreen() {
  const { heroId } = useLocalSearchParams<{ heroId: string }>();
  const router = useRouter();

  const gameStateRef = useRef<GameState | null>(null);
  const inputRef = useRef<GameInput>({ moveX: 0, moveY: 0, attackPressed: false, abilityIndex: -1 });
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Render state (updated each frame)
  const [renderEntities, setRenderEntities] = useState<RenderEntity[]>([]);
  const [hudData, setHudData] = useState({
    hp: 0, maxHp: 0, mana: 0, maxMana: 0,
    level: 1, xp: 0, xpToNext: 100,
    gold: 0, kills: 0, deaths: 0, assists: 0,
    gameTime: 0, blueKills: 0, redKills: 0,
    abilities: [] as { icon: string; cd: number; manaCost: number; canUse: boolean }[],
    isDead: false, respawnTimer: 0,
    isGameOver: false, winner: null as string | null,
    killFeed: [] as { killerName: string; victimName: string; killerTeam: string }[],
  });

  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);

  // ── Joystick state ──
  const joystickRef = useRef({ x: 0, y: 0, active: false });

  const joystickPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        joystickRef.current.active = true;
      },
      onPanResponderMove: (_, gesture) => {
        const maxDist = 50;
        const dx = Math.max(-maxDist, Math.min(maxDist, gesture.dx));
        const dy = Math.max(-maxDist, Math.min(maxDist, gesture.dy));
        joystickRef.current.x = dx / maxDist;
        joystickRef.current.y = dy / maxDist;
        inputRef.current.moveX = joystickRef.current.x;
        inputRef.current.moveY = joystickRef.current.y;
      },
      onPanResponderRelease: () => {
        joystickRef.current = { x: 0, y: 0, active: false };
        inputRef.current.moveX = 0;
        inputRef.current.moveY = 0;
      },
      onPanResponderTerminate: () => {
        joystickRef.current = { x: 0, y: 0, active: false };
        inputRef.current.moveX = 0;
        inputRef.current.moveY = 0;
      },
    })
  ).current;

  // ── Initialize game ──
  useEffect(() => {
    gameStateRef.current = initGame(heroId || 'varen');
    lastTimeRef.current = Date.now();
    startGameLoop();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [heroId]);

  const startGameLoop = useCallback(() => {
    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05); // cap at 50ms
      lastTimeRef.current = now;

      if (gameStateRef.current) {
        // Reset ability index after use
        const input = { ...inputRef.current };
        inputRef.current.abilityIndex = -1;

        gameStateRef.current = updateGame(gameStateRef.current, dt, input);
        updateRenderState(gameStateRef.current);
      }

      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  const updateRenderState = useCallback((state: GameState) => {
    const player = getPlayer(state);
    if (!player) return;

    setCameraX(state.cameraX);
    setCameraY(state.cameraY);

    // Collect visible entities
    const halfW = VIEWPORT_W / 2 + 100;
    const halfH = VIEWPORT_H / 2 + 100;
    const entities: RenderEntity[] = [];

    for (const entity of Object.values(state.entities)) {
      const screenX = entity.x - state.cameraX + VIEWPORT_W / 2;
      const screenY = entity.y - state.cameraY + VIEWPORT_H / 2;

      if (
        screenX > -100 &&
        screenX < VIEWPORT_W + 100 &&
        screenY > -100 &&
        screenY < VIEWPORT_H + 100
      ) {
        const re: RenderEntity = {
          id: entity.id,
          type: entity.type,
          team: entity.team,
          x: screenX,
          y: screenY,
          size: entity.size,
          hp: entity.hp,
          maxHp: entity.maxHp,
          isDead: entity.isDead,
        };

        if (entity.type === 'hero') {
          const hero = entity as HeroEntity;
          const heroDef = HEROES.find((h) => h.id === hero.heroId);
          re.icon = heroDef?.icon;
          re.name = heroDef?.name;
          re.level = hero.level;
          re.isPlayer = hero.isPlayer;
          re.mana = hero.mana;
          re.maxMana = hero.maxMana;
          re.heroClass = hero.heroClass;
        }

        entities.push(re);
      }
    }

    // Also render projectiles
    for (const proj of state.projectiles) {
      const screenX = proj.x - state.cameraX + VIEWPORT_W / 2;
      const screenY = proj.y - state.cameraY + VIEWPORT_H / 2;
      if (screenX > -50 && screenX < VIEWPORT_W + 50 && screenY > -50 && screenY < VIEWPORT_H + 50) {
        entities.push({
          id: proj.id,
          type: 'projectile',
          team: proj.team,
          x: screenX,
          y: screenY,
          size: proj.size,
          hp: 1,
          maxHp: 1,
          isDead: false,
        });
      }
    }

    setRenderEntities(entities);

    // Update HUD
    setHudData({
      hp: Math.round(player.hp),
      maxHp: player.maxHp,
      mana: Math.round(player.mana),
      maxMana: player.maxMana,
      level: player.level,
      xp: player.xp,
      xpToNext: player.xpToNext,
      gold: player.gold,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      gameTime: state.gameTime,
      blueKills: state.blueKills,
      redKills: state.redKills,
      abilities: player.abilities.map((a) => ({
        icon: a.def.icon,
        cd: Math.ceil(a.cooldownRemaining),
        manaCost: a.def.manaCost,
        canUse: a.cooldownRemaining <= 0 && player.mana >= a.def.manaCost,
      })),
      isDead: player.isDead,
      respawnTimer: Math.ceil(player.respawnTimer),
      isGameOver: state.isGameOver,
      winner: state.winner,
      killFeed: state.killFeed.map((kf) => ({
        killerName: kf.killerName,
        victimName: kf.victimName,
        killerTeam: kf.killerTeam,
      })),
    });
  }, []);

  const handleAbility = useCallback((index: number) => {
    inputRef.current.abilityIndex = index;
  }, []);

  const handleAttack = useCallback(() => {
    inputRef.current.attackPressed = true;
    setTimeout(() => {
      inputRef.current.attackPressed = false;
    }, 100);
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* ── Top HUD ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => router.back()}>
          <Text style={styles.menuBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.scoreBoard}>
          <Text style={[styles.scoreText, { color: GAME_COLORS.blue.primary }]}>
            {hudData.blueKills}
          </Text>
          <Text style={styles.timer}>{formatTime(hudData.gameTime)}</Text>
          <Text style={[styles.scoreText, { color: GAME_COLORS.red.primary }]}>
            {hudData.redKills}
          </Text>
        </View>
        <View style={styles.kdaBox}>
          <Text style={styles.kdaText}>
            {hudData.kills}/{hudData.deaths}/{hudData.assists}
          </Text>
        </View>
      </View>

      {/* ── Kill Feed ── */}
      <View style={styles.killFeed}>
        {hudData.killFeed.map((entry, i) => (
          <View key={i} style={styles.killFeedEntry}>
            <Text
              style={[
                styles.killFeedText,
                { color: entry.killerTeam === 'blue' ? GAME_COLORS.blue.light : GAME_COLORS.red.light },
              ]}
            >
              {entry.killerName}
            </Text>
            <Text style={styles.killFeedArrow}> ⚔ </Text>
            <Text
              style={[
                styles.killFeedText,
                { color: entry.killerTeam === 'blue' ? GAME_COLORS.red.light : GAME_COLORS.blue.light },
              ]}
            >
              {entry.victimName}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Game Arena ── */}
      <View style={styles.arena}>
        {/* Map background lines */}
        <View
          style={[
            styles.mapLane,
            {
              top: MAP.laneY - cameraY + VIEWPORT_H / 2 - 40,
              left: -cameraX + VIEWPORT_W / 2,
              width: MAP.width,
            },
          ]}
        />

        {/* Render entities */}
        {renderEntities.map((entity) => (
          <EntityView key={entity.id} entity={entity} />
        ))}

        {/* Death overlay */}
        {hudData.isDead && (
          <View style={styles.deathOverlay}>
            <Text style={styles.deathText}>DEFEATED</Text>
            <Text style={styles.respawnText}>
              Respawning in {hudData.respawnTimer}s
            </Text>
          </View>
        )}

        {/* Game over overlay */}
        {hudData.isGameOver && (
          <View style={styles.gameOverOverlay}>
            <Text
              style={[
                styles.gameOverText,
                {
                  color:
                    hudData.winner === 'blue'
                      ? GAME_COLORS.blue.primary
                      : GAME_COLORS.red.primary,
                },
              ]}
            >
              {hudData.winner === 'blue' ? 'VICTORY' : 'DEFEAT'}
            </Text>
            <Text style={styles.gameOverSub}>
              {hudData.blueKills} - {hudData.redKills}
            </Text>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.returnBtnText}>Return to Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Bottom Controls ── */}
      <View style={styles.bottomBar}>
        {/* Player info */}
        <View style={styles.playerInfo}>
          <View style={styles.hpBarContainer}>
            <View style={styles.hpBarBg}>
              <View
                style={[
                  styles.hpBarFill,
                  {
                    width: `${(hudData.hp / hudData.maxHp) * 100}%`,
                    backgroundColor:
                      hudData.hp / hudData.maxHp > 0.5
                        ? GAME_COLORS.hp.high
                        : hudData.hp / hudData.maxHp > 0.25
                        ? GAME_COLORS.hp.mid
                        : GAME_COLORS.hp.low,
                  },
                ]}
              />
            </View>
            <Text style={styles.hpText}>
              {hudData.hp}/{hudData.maxHp}
            </Text>
          </View>
          <View style={styles.manaBarContainer}>
            <View style={styles.manaBarBg}>
              <View
                style={[
                  styles.manaBarFill,
                  { width: `${(hudData.mana / hudData.maxMana) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.manaText}>
              {hudData.mana}/{hudData.maxMana}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.levelText}>Lv.{hudData.level}</Text>
            <Text style={styles.goldText}>💰 {hudData.gold}</Text>
          </View>
        </View>

        {/* Joystick */}
        <View style={styles.joystickArea} {...joystickPanResponder.panHandlers}>
          <View style={styles.joystickOuter}>
            <View
              style={[
                styles.joystickInner,
                {
                  transform: [
                    { translateX: joystickRef.current.x * 30 },
                    { translateY: joystickRef.current.y * 30 },
                  ],
                },
              ]}
            />
          </View>
        </View>

        {/* Abilities + Attack */}
        <View style={styles.actionButtons}>
          {/* Attack button */}
          <TouchableOpacity
            style={styles.attackBtn}
            onPress={handleAttack}
            activeOpacity={0.6}
          >
            <Text style={styles.attackBtnIcon}>⚔️</Text>
          </TouchableOpacity>

          {/* Ability buttons */}
          <View style={styles.abilityRow}>
            {hudData.abilities.map((ability, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.abilityBtn,
                  !ability.canUse && styles.abilityBtnDisabled,
                ]}
                onPress={() => handleAbility(i)}
                disabled={!ability.canUse}
                activeOpacity={0.6}
              >
                <Text style={styles.abilityBtnIcon}>{ability.icon}</Text>
                {ability.cd > 0 && (
                  <View style={styles.abilityCdOverlay}>
                    <Text style={styles.abilityCdText}>{ability.cd}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Entity Renderer ───────────────────────────────────────────────

function EntityView({ entity }: { entity: RenderEntity }) {
  if (entity.isDead) return null;

  const teamColors = entity.team === 'blue' ? GAME_COLORS.blue : GAME_COLORS.red;
  const hpPct = entity.hp / entity.maxHp;

  if (entity.type === 'projectile') {
    return (
      <View
        style={[
          styles.projectile,
          {
            left: entity.x - entity.size,
            top: entity.y - entity.size,
            width: entity.size * 2,
            height: entity.size * 2,
            backgroundColor: teamColors.primary,
          },
        ]}
      />
    );
  }

  if (entity.type === 'hero') {
    return (
      <View
        style={[
          styles.entityContainer,
          {
            left: entity.x - entity.size - 5,
            top: entity.y - entity.size - 20,
            width: entity.size * 2 + 10,
          },
        ]}
      >
        {/* Name + Level */}
        <Text
          style={[
            styles.entityName,
            {
              color: entity.isPlayer ? '#ffdd44' : teamColors.light,
              fontWeight: entity.isPlayer ? '700' : '500',
            },
          ]}
          numberOfLines={1}
        >
          {entity.isPlayer ? '★ ' : ''}
          {entity.name} Lv.{entity.level}
        </Text>

        {/* HP Bar */}
        <View style={styles.entityHpBg}>
          <View
            style={[
              styles.entityHpFill,
              {
                width: `${hpPct * 100}%`,
                backgroundColor:
                  hpPct > 0.5 ? GAME_COLORS.hp.high :
                  hpPct > 0.25 ? GAME_COLORS.hp.mid :
                  GAME_COLORS.hp.low,
              },
            ]}
          />
        </View>

        {/* Mana Bar */}
        {entity.mana !== undefined && (
          <View style={styles.entityManaBg}>
            <View
              style={[
                styles.entityManaFill,
                { width: `${((entity.mana || 0) / (entity.maxMana || 1)) * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Hero body */}
        <View
          style={[
            styles.heroBody,
            {
              width: entity.size * 2,
              height: entity.size * 2,
              borderColor: entity.isPlayer ? '#ffdd44' : teamColors.primary,
              backgroundColor: teamColors.dark,
            },
          ]}
        >
          <Text style={styles.heroEmoji}>{entity.icon}</Text>
        </View>
      </View>
    );
  }

  if (entity.type === 'turret') {
    return (
      <View
        style={[
          styles.entityContainer,
          {
            left: entity.x - entity.size,
            top: entity.y - entity.size - 14,
            width: entity.size * 2,
          },
        ]}
      >
        <View style={styles.entityHpBg}>
          <View
            style={[
              styles.entityHpFill,
              {
                width: `${hpPct * 100}%`,
                backgroundColor: teamColors.primary,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.turretBody,
            {
              width: entity.size * 2,
              height: entity.size * 2,
              backgroundColor: teamColors.dark,
              borderColor: teamColors.primary,
            },
          ]}
        >
          <Text style={styles.turretIcon}>🗼</Text>
        </View>
      </View>
    );
  }

  if (entity.type === 'base') {
    return (
      <View
        style={[
          styles.entityContainer,
          {
            left: entity.x - entity.size,
            top: entity.y - entity.size - 14,
            width: entity.size * 2,
          },
        ]}
      >
        <View style={styles.entityHpBg}>
          <View
            style={[
              styles.entityHpFill,
              {
                width: `${hpPct * 100}%`,
                backgroundColor: teamColors.primary,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.baseBody,
            {
              width: entity.size * 2,
              height: entity.size * 2,
              backgroundColor: teamColors.dark,
              borderColor: teamColors.primary,
            },
          ]}
        >
          <Text style={styles.baseIcon}>🏰</Text>
        </View>
      </View>
    );
  }

  if (entity.type === 'minion') {
    return (
      <View
        style={[
          styles.entityContainer,
          {
            left: entity.x - entity.size,
            top: entity.y - entity.size - 8,
            width: entity.size * 2,
          },
        ]}
      >
        <View style={[styles.entityHpBg, { height: 2 }]}>
          <View
            style={[
              styles.entityHpFill,
              {
                width: `${hpPct * 100}%`,
                backgroundColor: teamColors.primary,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.minionBody,
            {
              width: entity.size * 2,
              height: entity.size * 2,
              backgroundColor: teamColors.dark,
              borderColor: teamColors.primary,
            },
          ]}
        />
      </View>
    );
  }

  return null;
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.map.ground,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 44,
    paddingBottom: 6,
    backgroundColor: 'rgba(10, 14, 20, 0.9)',
    zIndex: 10,
  },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a3a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnText: { color: '#ddeeff', fontSize: 16, fontWeight: '700' },
  scoreBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreText: { fontSize: 22, fontWeight: '800' },
  timer: { color: '#889aaa', fontSize: 14, fontWeight: '600' },
  kdaBox: {
    backgroundColor: '#1a2332',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kdaText: { color: '#ddeeff', fontSize: 13, fontWeight: '600' },

  // Kill feed
  killFeed: {
    position: 'absolute',
    top: 80,
    right: 8,
    zIndex: 20,
  },
  killFeedEntry: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 14, 20, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  killFeedText: { fontSize: 11, fontWeight: '600' },
  killFeedArrow: { color: '#889aaa', fontSize: 11 },

  // Arena
  arena: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: GAME_COLORS.map.ground,
  },
  mapLane: {
    position: 'absolute',
    height: 80,
    backgroundColor: GAME_COLORS.map.lane,
    opacity: 0.4,
  },

  // Entities
  entityContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  entityName: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 1,
  },
  entityHpBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  entityHpFill: {
    height: '100%',
    borderRadius: 2,
  },
  entityManaBg: {
    width: '100%',
    height: 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 1,
    marginBottom: 2,
    overflow: 'hidden',
  },
  entityManaFill: {
    height: '100%',
    borderRadius: 1,
    backgroundColor: GAME_COLORS.mana,
  },
  heroBody: {
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 18 },
  turretBody: {
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turretIcon: { fontSize: 22 },
  baseBody: {
    borderRadius: 8,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseIcon: { fontSize: 30 },
  minionBody: {
    borderRadius: 999,
    borderWidth: 1.5,
  },
  projectile: {
    position: 'absolute',
    borderRadius: 999,
  },

  // Death overlay
  deathOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  deathText: {
    color: '#ff4444',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
  },
  respawnText: {
    color: '#ddeeff',
    fontSize: 18,
    marginTop: 8,
  },

  // Game over
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
  },
  gameOverSub: {
    color: '#ddeeff',
    fontSize: 24,
    marginTop: 8,
    fontWeight: '600',
  },
  returnBtn: {
    marginTop: 24,
    backgroundColor: '#4488ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 27,
  },
  returnBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 24,
    backgroundColor: 'rgba(10, 14, 20, 0.95)',
    height: 160,
  },
  playerInfo: {
    width: 100,
  },
  hpBarContainer: { marginBottom: 4 },
  hpBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#1a2332',
    borderRadius: 5,
    overflow: 'hidden',
  },
  hpBarFill: { height: '100%', borderRadius: 5 },
  hpText: { color: '#ddeeff', fontSize: 9, textAlign: 'center', marginTop: 1 },
  manaBarContainer: { marginBottom: 4 },
  manaBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#1a2332',
    borderRadius: 3,
    overflow: 'hidden',
  },
  manaBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: GAME_COLORS.mana,
  },
  manaText: { color: '#88aaff', fontSize: 9, textAlign: 'center', marginTop: 1 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  levelText: { color: '#ddaa22', fontSize: 12, fontWeight: '700' },
  goldText: { color: '#ffcc00', fontSize: 11, fontWeight: '600' },

  // Joystick
  joystickArea: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystickOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystickInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  // Actions
  actionButtons: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  attackBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#cc3333',
    borderWidth: 3,
    borderColor: '#ff5555',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  attackBtnIcon: { fontSize: 28 },
  abilityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  abilityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a3a5a',
    borderWidth: 2,
    borderColor: '#4488ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abilityBtnDisabled: {
    opacity: 0.4,
    borderColor: '#2a3a4a',
  },
  abilityBtnIcon: { fontSize: 18 },
  abilityCdOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abilityCdText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
