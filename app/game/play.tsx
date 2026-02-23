import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  GameState, GameInput, HeroEntity, RenderEntity,
  GameMode, DifficultyLevel, PingType, BrushZone, DamageLogEntry,
} from '../../src/game/types';
import { initGame, updateGame, getPlayer, isNearBase } from '../../src/game/engine';
import { MAP, GAME, GAME_COLORS, HEROES, ITEMS, SKINS, TUTORIAL_STEPS } from '../../src/game/data';
import { processGameEnd, getEquippedSkin } from '../../src/game/progression';
import ShopOverlay from './shop';
import TutorialOverlay from './tutorial';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const VIEWPORT_W = SCREEN_W;
const VIEWPORT_H = SCREEN_H - 160;

export default function GamePlayScreen() {
  const params = useLocalSearchParams<{
    heroId: string; mode: string; difficulty: string; tutorial: string;
  }>();
  const router = useRouter();
  const heroId = params.heroId || 'varen';
  const mode = (params.mode || 'quick') as GameMode;
  const difficulty = (params.difficulty || 'normal') as DifficultyLevel;
  const isTutorial = params.tutorial === 'true';

  const gameStateRef = useRef<GameState | null>(null);
  const inputRef = useRef<GameInput>({ moveX: 0, moveY: 0, attackPressed: false, abilityIndex: -1 });
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const prevKillsRef = useRef(0);
  const prevDeathsRef = useRef(0);
  const gameEndProcessedRef = useRef(false);

  const [renderEntities, setRenderEntities] = useState<RenderEntity[]>([]);
  const [brushRender, setBrushRender] = useState<BrushZone[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(isTutorial ? 0 : -1);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  const [hudData, setHudData] = useState({
    hp: 0, maxHp: 0, mana: 0, maxMana: 0, level: 1, xp: 0, xpToNext: 100,
    gold: 0, kills: 0, deaths: 0, assists: 0, gameTime: 0,
    blueKills: 0, redKills: 0,
    abilities: [] as { icon: string; cd: number; manaCost: number; canUse: boolean }[],
    isDead: false, respawnTimer: 0, isGameOver: false, winner: null as string | null,
    killFeed: [] as { killerName: string; victimName: string; killerTeam: string }[],
    announcements: [] as { text: string; color: string }[],
    pings: [] as { type: PingType; x: number; y: number }[],
    items: [] as string[],
    buffs: [] as { icon: string }[],
    nearBase: false,
    damageLog: [] as DamageLogEntry[],
    totalDamageDealt: 0,
  });

  const joystickRef = useRef({ x: 0, y: 0, active: false });
  const joystickPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { joystickRef.current.active = true; },
      onPanResponderMove: (_, g) => {
        const max = 50;
        const dx = Math.max(-max, Math.min(max, g.dx));
        const dy = Math.max(-max, Math.min(max, g.dy));
        joystickRef.current.x = dx / max;
        joystickRef.current.y = dy / max;
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

  useEffect(() => {
    const skinId = getEquippedSkin(heroId);
    gameStateRef.current = initGame(heroId, mode, difficulty, skinId);
    lastTimeRef.current = Date.now();
    gameEndProcessedRef.current = false;
    startGameLoop();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [heroId]);

  const startGameLoop = useCallback(() => {
    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (gameStateRef.current) {
        const input = { ...inputRef.current };
        inputRef.current.abilityIndex = -1;
        inputRef.current.buyItemId = undefined;
        inputRef.current.pingType = undefined;

        gameStateRef.current = updateGame(gameStateRef.current, dt, input);
        updateRenderState(gameStateRef.current);

        // Haptic feedback
        const player = getPlayer(gameStateRef.current);
        if (player) {
          if (player.kills > prevKillsRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            prevKillsRef.current = player.kills;
          }
          if (player.deaths > prevDeathsRef.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            prevDeathsRef.current = player.deaths;
          }
        }

        // Process game end
        if (gameStateRef.current.isGameOver && !gameEndProcessedRef.current) {
          gameEndProcessedRef.current = true;
          const p = getPlayer(gameStateRef.current);
          if (p) {
            const won = gameStateRef.current.winner === p.team;
            processGameEnd(gameStateRef.current, won, p);
          }
        }
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

    const entities: RenderEntity[] = [];
    for (const entity of Object.values(state.entities)) {
      const sx = entity.x - state.cameraX + VIEWPORT_W / 2;
      const sy = entity.y - state.cameraY + VIEWPORT_H / 2;
      if (sx < -100 || sx > VIEWPORT_W + 100 || sy < -100 || sy > VIEWPORT_H + 100) continue;

      const re: RenderEntity = {
        id: entity.id, type: entity.type, team: entity.team,
        x: sx, y: sy, size: entity.size, hp: entity.hp, maxHp: entity.maxHp,
        isDead: entity.isDead, inBrush: entity.inBrush,
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
        re.buffs = hero.buffs.map((b) => ({ icon: b.icon }));
        if (hero.skinId) {
          const skin = SKINS.find((s) => s.id === hero.skinId);
          if (skin) { re.bodyColor = skin.bodyColor; re.borderColor = skin.borderColor; }
        }
      }

      if (entity.type === 'jungle') {
        re.icon = (entity as any).icon;
        re.name = (entity as any).campId;
      }

      entities.push(re);
    }

    for (const proj of state.projectiles) {
      const sx = proj.x - state.cameraX + VIEWPORT_W / 2;
      const sy = proj.y - state.cameraY + VIEWPORT_H / 2;
      if (sx > -50 && sx < VIEWPORT_W + 50 && sy > -50 && sy < VIEWPORT_H + 50) {
        entities.push({
          id: proj.id, type: 'projectile', team: proj.team,
          x: sx, y: sy, size: proj.size, hp: 1, maxHp: 1, isDead: false,
        });
      }
    }

    setRenderEntities(entities);

    const visibleBrush = state.brushZones.map((b) => ({
      x: b.x - state.cameraX + VIEWPORT_W / 2,
      y: b.y - state.cameraY + VIEWPORT_H / 2,
      width: b.width, height: b.height,
    })).filter((b) => b.x + b.width > 0 && b.x < VIEWPORT_W && b.y + b.height > 0 && b.y < VIEWPORT_H);
    setBrushRender(visibleBrush);

    setHudData({
      hp: Math.round(player.hp), maxHp: player.maxHp,
      mana: Math.round(player.mana), maxMana: player.maxMana,
      level: player.level, xp: player.xp, xpToNext: player.xpToNext,
      gold: player.gold, kills: player.kills, deaths: player.deaths, assists: player.assists,
      gameTime: state.gameTime, blueKills: state.blueKills, redKills: state.redKills,
      abilities: player.abilities.map((a) => ({
        icon: a.def.icon, cd: Math.ceil(a.cooldownRemaining),
        manaCost: a.def.manaCost, canUse: a.cooldownRemaining <= 0 && player.mana >= a.def.manaCost,
      })),
      isDead: player.isDead, respawnTimer: Math.ceil(player.respawnTimer),
      isGameOver: state.isGameOver, winner: state.winner,
      killFeed: state.killFeed.map((kf) => ({ killerName: kf.killerName, victimName: kf.victimName, killerTeam: kf.killerTeam })),
      announcements: state.announcements.map((a) => ({ text: a.text, color: a.color })),
      pings: state.pings.map((p) => ({
        type: p.type,
        x: p.x - state.cameraX + VIEWPORT_W / 2,
        y: p.y - state.cameraY + VIEWPORT_H / 2,
      })),
      items: player.items,
      buffs: player.buffs.map((b) => ({ icon: b.icon })),
      nearBase: isNearBase(state),
      damageLog: player.damageLog,
      totalDamageDealt: player.totalDamageDealt,
    });
  }, []);

  const handleAbility = useCallback((i: number) => {
    inputRef.current.abilityIndex = i;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAttack = useCallback(() => {
    inputRef.current.attackPressed = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => { inputRef.current.attackPressed = false; }, 100);
  }, []);

  const handleBuyItem = useCallback((itemId: string) => {
    inputRef.current.buyItemId = itemId;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handlePing = useCallback((type: PingType) => {
    inputRef.current.pingType = type;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const PING_ICONS: Record<PingType, string> = { attack: '⚔️', retreat: '🔙', onMyWay: '🏃', danger: '⚠️' };
  const PING_COLORS: Record<PingType, string> = { attack: '#ff4444', retreat: '#44ff44', onMyWay: '#4488ff', danger: '#ffaa00' };

  return (
    <View style={styles.container}>
      {/* Top HUD */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => router.back()}>
          <Text style={styles.menuBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.scoreBoard}>
          <Text style={[styles.scoreText, { color: GAME_COLORS.blue.primary }]}>{hudData.blueKills}</Text>
          <Text style={styles.timer}>{formatTime(hudData.gameTime)}</Text>
          <Text style={[styles.scoreText, { color: GAME_COLORS.red.primary }]}>{hudData.redKills}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={styles.kdaBox}>
            <Text style={styles.kdaText}>{hudData.kills}/{hudData.deaths}/{hudData.assists}</Text>
          </View>
          <View style={styles.pingRow}>
            {(['attack', 'retreat', 'onMyWay', 'danger'] as PingType[]).map((p) => (
              <TouchableOpacity key={p} style={[styles.pingBtn, { borderColor: PING_COLORS[p] }]} onPress={() => handlePing(p)}>
                <Text style={styles.pingBtnIcon}>{PING_ICONS[p]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Announcements */}
      {hudData.announcements.length > 0 && (
        <View style={styles.announcementArea}>
          {hudData.announcements.map((a, i) => (
            <Text key={i} style={[styles.announcementText, { color: a.color }]}>{a.text}</Text>
          ))}
        </View>
      )}

      {/* Kill Feed */}
      <View style={styles.killFeed}>
        {hudData.killFeed.map((entry, i) => (
          <View key={i} style={styles.killFeedEntry}>
            <Text style={[styles.killFeedText, { color: entry.killerTeam === 'blue' ? GAME_COLORS.blue.light : GAME_COLORS.red.light }]}>{entry.killerName}</Text>
            <Text style={styles.killFeedArrow}> ⚔ </Text>
            <Text style={[styles.killFeedText, { color: entry.killerTeam === 'blue' ? GAME_COLORS.red.light : GAME_COLORS.blue.light }]}>{entry.victimName}</Text>
          </View>
        ))}
      </View>

      {/* Arena */}
      <View style={styles.arena}>
        <View style={[styles.mapLane, { top: MAP.laneY - cameraY + VIEWPORT_H / 2 - 40, left: -cameraX + VIEWPORT_W / 2, width: MAP.width }]} />

        {brushRender.map((b, i) => (
          <View key={`brush_${i}`} style={[styles.brushZone, { left: b.x, top: b.y, width: b.width, height: b.height }]} />
        ))}

        {hudData.pings.map((p, i) => (
          <View key={`ping_${i}`} style={[styles.pingIndicator, { left: p.x - 15, top: p.y - 15, borderColor: PING_COLORS[p.type] }]}>
            <Text style={styles.pingIndicatorIcon}>{PING_ICONS[p.type]}</Text>
          </View>
        ))}

        {renderEntities.map((entity) => <EntityView key={entity.id} entity={entity} />)}

        {hudData.isDead && (
          <View style={styles.deathOverlay}>
            <Text style={styles.deathText}>DEFEATED</Text>
            <Text style={styles.respawnText}>Respawning in {hudData.respawnTimer}s</Text>
            {hudData.damageLog.length > 0 && (
              <View style={styles.deathRecap}>
                <Text style={styles.deathRecapTitle}>Damage Taken</Text>
                {hudData.damageLog.slice(-5).reverse().map((d, i) => (
                  <View key={i} style={styles.recapRow}>
                    <Text style={styles.recapSource}>{d.sourceName}</Text>
                    {d.abilityName && <Text style={styles.recapAbility}>{d.abilityName}</Text>}
                    <Text style={styles.recapDmg}>-{d.damage}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {hudData.isGameOver && (
          <View style={styles.gameOverOverlay}>
            <Text style={[styles.gameOverText, { color: hudData.winner === 'blue' ? GAME_COLORS.blue.primary : GAME_COLORS.red.primary }]}>
              {hudData.winner === 'blue' ? 'VICTORY' : 'DEFEAT'}
            </Text>
            <Text style={styles.gameOverSub}>{hudData.blueKills} - {hudData.redKills}</Text>
            <View style={styles.gameOverStats}>
              <Text style={styles.gameOverStatText}>KDA: {hudData.kills}/{hudData.deaths}/{hudData.assists}</Text>
              <Text style={styles.gameOverStatText}>Damage: {hudData.totalDamageDealt}</Text>
              <Text style={styles.gameOverStatText}>Gold: {hudData.gold}</Text>
            </View>
            <TouchableOpacity style={styles.returnBtn} onPress={() => router.back()}>
              <Text style={styles.returnBtnText}>Return to Lobby</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.playerInfo}>
          <View style={styles.hpBarBg}>
            <View style={[styles.hpBarFill, {
              width: `${(hudData.hp / hudData.maxHp) * 100}%`,
              backgroundColor: hudData.hp / hudData.maxHp > 0.5 ? GAME_COLORS.hp.high : hudData.hp / hudData.maxHp > 0.25 ? GAME_COLORS.hp.mid : GAME_COLORS.hp.low,
            }]} />
          </View>
          <Text style={styles.hpText}>{hudData.hp}/{hudData.maxHp}</Text>
          <View style={styles.manaBarBg}>
            <View style={[styles.manaBarFill, { width: `${(hudData.mana / hudData.maxMana) * 100}%` }]} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.levelText}>Lv.{hudData.level}</Text>
            <Text style={styles.goldText}>💰{hudData.gold}</Text>
          </View>
          {hudData.buffs.length > 0 && (
            <View style={styles.buffsRow}>
              {hudData.buffs.map((b, i) => <Text key={i} style={styles.buffIcon}>{b.icon}</Text>)}
            </View>
          )}
          <View style={styles.itemsRow}>
            {hudData.items.map((id, i) => {
              const item = ITEMS.find((it) => it.id === id);
              return <Text key={i} style={styles.itemIcon}>{item?.icon || '?'}</Text>;
            })}
            {hudData.nearBase && hudData.items.length < 6 && (
              <TouchableOpacity style={styles.shopBtn} onPress={() => setShowShop(true)}>
                <Text style={styles.shopBtnText}>🛒</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.joystickArea} {...joystickPanResponder.panHandlers}>
          <View style={styles.joystickOuter}>
            <View style={[styles.joystickInner, {
              transform: [{ translateX: joystickRef.current.x * 30 }, { translateY: joystickRef.current.y * 30 }],
            }]} />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.attackBtn} onPress={handleAttack} activeOpacity={0.6}>
            <Text style={styles.attackBtnIcon}>⚔️</Text>
          </TouchableOpacity>
          <View style={styles.abilityRow}>
            {hudData.abilities.map((a, i) => (
              <TouchableOpacity key={i} style={[styles.abilityBtn, !a.canUse && styles.abilityBtnDisabled]} onPress={() => handleAbility(i)} disabled={!a.canUse} activeOpacity={0.6}>
                <Text style={styles.abilityBtnIcon}>{a.icon}</Text>
                {a.cd > 0 && (
                  <View style={styles.abilityCdOverlay}><Text style={styles.abilityCdText}>{a.cd}</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {showShop && <ShopOverlay gold={hudData.gold} ownedItems={hudData.items} onBuy={handleBuyItem} onClose={() => setShowShop(false)} />}
      {tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length && (
        <TutorialOverlay step={TUTORIAL_STEPS[tutorialStep]} stepIndex={tutorialStep} totalSteps={TUTORIAL_STEPS.length}
          onNext={() => setTutorialStep((s) => s + 1 >= TUTORIAL_STEPS.length ? -1 : s + 1)}
          onSkip={() => setTutorialStep(-1)}
        />
      )}
    </View>
  );
}

function EntityView({ entity }: { entity: RenderEntity }) {
  if (entity.isDead) return null;
  const teamColors = entity.team === 'blue' ? GAME_COLORS.blue : GAME_COLORS.red;
  const hpPct = entity.hp / entity.maxHp;
  const brushOpacity = entity.inBrush ? 0.5 : 1;

  if (entity.type === 'projectile') {
    return <View style={[styles.projectile, { left: entity.x - entity.size, top: entity.y - entity.size, width: entity.size * 2, height: entity.size * 2, backgroundColor: teamColors.primary }]} />;
  }

  if (entity.type === 'hero') {
    const bodyColor = entity.bodyColor || teamColors.dark;
    const borderColor = entity.borderColor || (entity.isPlayer ? '#ffdd44' : teamColors.primary);
    return (
      <View style={[styles.entityContainer, { left: entity.x - entity.size - 5, top: entity.y - entity.size - 22, width: entity.size * 2 + 10, opacity: brushOpacity }]}>
        <Text style={[styles.entityName, { color: entity.isPlayer ? '#ffdd44' : teamColors.light, fontWeight: entity.isPlayer ? '700' : '500' }]} numberOfLines={1}>
          {entity.isPlayer ? '★ ' : ''}{entity.name} Lv.{entity.level}
        </Text>
        <View style={styles.entityHpBg}>
          <View style={[styles.entityHpFill, { width: `${hpPct * 100}%`, backgroundColor: hpPct > 0.5 ? GAME_COLORS.hp.high : hpPct > 0.25 ? GAME_COLORS.hp.mid : GAME_COLORS.hp.low }]} />
        </View>
        {entity.mana !== undefined && (
          <View style={styles.entityManaBg}><View style={[styles.entityManaFill, { width: `${((entity.mana || 0) / (entity.maxMana || 1)) * 100}%` }]} /></View>
        )}
        {entity.buffs && entity.buffs.length > 0 && (
          <View style={styles.buffIndicatorRow}>{entity.buffs.map((b, i) => <Text key={i} style={styles.buffIndicator}>{b.icon}</Text>)}</View>
        )}
        <View style={[styles.heroBody, { width: entity.size * 2, height: entity.size * 2, borderColor, backgroundColor: bodyColor }]}>
          <Text style={styles.heroEmoji}>{entity.icon}</Text>
        </View>
      </View>
    );
  }

  if (entity.type === 'turret') {
    return (
      <View style={[styles.entityContainer, { left: entity.x - entity.size, top: entity.y - entity.size - 14, width: entity.size * 2 }]}>
        <View style={styles.entityHpBg}><View style={[styles.entityHpFill, { width: `${hpPct * 100}%`, backgroundColor: teamColors.primary }]} /></View>
        <View style={[styles.turretBody, { width: entity.size * 2, height: entity.size * 2, backgroundColor: teamColors.dark, borderColor: teamColors.primary }]}>
          <Text style={styles.turretIcon}>🗼</Text>
        </View>
      </View>
    );
  }

  if (entity.type === 'base') {
    return (
      <View style={[styles.entityContainer, { left: entity.x - entity.size, top: entity.y - entity.size - 14, width: entity.size * 2 }]}>
        <View style={styles.entityHpBg}><View style={[styles.entityHpFill, { width: `${hpPct * 100}%`, backgroundColor: teamColors.primary }]} /></View>
        <View style={[styles.baseBody, { width: entity.size * 2, height: entity.size * 2, backgroundColor: teamColors.dark, borderColor: teamColors.primary }]}>
          <Text style={styles.baseIcon}>🏰</Text>
        </View>
      </View>
    );
  }

  if (entity.type === 'minion') {
    return (
      <View style={[styles.entityContainer, { left: entity.x - entity.size, top: entity.y - entity.size - 8, width: entity.size * 2, opacity: brushOpacity }]}>
        <View style={[styles.entityHpBg, { height: 2 }]}><View style={[styles.entityHpFill, { width: `${hpPct * 100}%`, backgroundColor: teamColors.primary }]} /></View>
        <View style={[styles.minionBody, { width: entity.size * 2, height: entity.size * 2, backgroundColor: teamColors.dark, borderColor: teamColors.primary }]} />
      </View>
    );
  }

  if (entity.type === 'jungle') {
    return (
      <View style={[styles.entityContainer, { left: entity.x - entity.size, top: entity.y - entity.size - 14, width: entity.size * 2 }]}>
        <View style={styles.entityHpBg}><View style={[styles.entityHpFill, { width: `${hpPct * 100}%`, backgroundColor: GAME_COLORS.jungle }]} /></View>
        <View style={[styles.jungleBody, { width: entity.size * 2, height: entity.size * 2 }]}>
          <Text style={styles.jungleIcon}>{entity.icon}</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GAME_COLORS.map.ground },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 44, paddingBottom: 4, backgroundColor: 'rgba(10,14,20,0.9)', zIndex: 10 },
  menuBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2a3a4a', alignItems: 'center', justifyContent: 'center' },
  menuBtnText: { color: '#ddeeff', fontSize: 14, fontWeight: '700' },
  scoreBoard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreText: { fontSize: 20, fontWeight: '800' },
  timer: { color: '#889aaa', fontSize: 13, fontWeight: '600' },
  topRight: { alignItems: 'flex-end' },
  kdaBox: { backgroundColor: '#1a2332', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  kdaText: { color: '#ddeeff', fontSize: 12, fontWeight: '600' },
  pingRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  pingBtn: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  pingBtnIcon: { fontSize: 10 },
  announcementArea: { position: 'absolute', top: 90, left: 0, right: 0, alignItems: 'center', zIndex: 25 },
  announcementText: { fontSize: 28, fontWeight: '900', letterSpacing: 3, textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  killFeed: { position: 'absolute', top: 76, right: 8, zIndex: 20 },
  killFeedEntry: { flexDirection: 'row', backgroundColor: 'rgba(10,14,20,0.8)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 2 },
  killFeedText: { fontSize: 10, fontWeight: '600' },
  killFeedArrow: { color: '#889aaa', fontSize: 10 },
  arena: { flex: 1, overflow: 'hidden', backgroundColor: GAME_COLORS.map.ground },
  mapLane: { position: 'absolute', height: 80, backgroundColor: GAME_COLORS.map.lane, opacity: 0.4 },
  brushZone: { position: 'absolute', backgroundColor: GAME_COLORS.brush, opacity: 0.35, borderRadius: 8 },
  pingIndicator: { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  pingIndicatorIcon: { fontSize: 14 },
  entityContainer: { position: 'absolute', alignItems: 'center' },
  entityName: { fontSize: 8, textAlign: 'center', marginBottom: 1 },
  entityHpBg: { width: '100%', height: 4, backgroundColor: '#1a1a1a', borderRadius: 2, marginBottom: 1, overflow: 'hidden' },
  entityHpFill: { height: '100%', borderRadius: 2 },
  entityManaBg: { width: '100%', height: 2, backgroundColor: '#1a1a1a', borderRadius: 1, marginBottom: 1, overflow: 'hidden' },
  entityManaFill: { height: '100%', borderRadius: 1, backgroundColor: GAME_COLORS.mana },
  buffIndicatorRow: { flexDirection: 'row', gap: 1, marginBottom: 1 },
  buffIndicator: { fontSize: 8 },
  heroBody: { borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 16 },
  turretBody: { borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  turretIcon: { fontSize: 20 },
  baseBody: { borderRadius: 8, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  baseIcon: { fontSize: 28 },
  minionBody: { borderRadius: 999, borderWidth: 1.5 },
  jungleBody: { borderRadius: 6, backgroundColor: '#3a2a1a', borderWidth: 2, borderColor: GAME_COLORS.jungle, alignItems: 'center', justifyContent: 'center' },
  jungleIcon: { fontSize: 18 },
  projectile: { position: 'absolute', borderRadius: 999 },
  deathOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  deathText: { color: '#ff4444', fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  respawnText: { color: '#ddeeff', fontSize: 16, marginTop: 6 },
  deathRecap: { backgroundColor: 'rgba(10,10,10,0.9)', borderRadius: 12, padding: 12, marginTop: 12, width: '70%' },
  deathRecapTitle: { color: '#ff6666', fontSize: 14, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  recapSource: { color: '#ddeeff', fontSize: 12, fontWeight: '600' },
  recapAbility: { color: '#88aacc', fontSize: 11 },
  recapDmg: { color: '#ff6644', fontSize: 12, fontWeight: '700' },
  gameOverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 40 },
  gameOverText: { fontSize: 44, fontWeight: '900', letterSpacing: 6 },
  gameOverSub: { color: '#ddeeff', fontSize: 22, marginTop: 6, fontWeight: '600' },
  gameOverStats: { marginTop: 12, alignItems: 'center' },
  gameOverStatText: { color: '#889aaa', fontSize: 14, marginBottom: 4 },
  returnBtn: { marginTop: 20, backgroundColor: '#4488ff', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 24 },
  returnBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 6, paddingBottom: 20, backgroundColor: 'rgba(10,14,20,0.95)', height: 160 },
  playerInfo: { width: 110 },
  hpBarBg: { width: '100%', height: 8, backgroundColor: '#1a2332', borderRadius: 4, overflow: 'hidden' },
  hpBarFill: { height: '100%', borderRadius: 4 },
  hpText: { color: '#ddeeff', fontSize: 8, textAlign: 'center', marginTop: 1 },
  manaBarBg: { width: '100%', height: 5, backgroundColor: '#1a2332', borderRadius: 2.5, overflow: 'hidden', marginTop: 2 },
  manaBarFill: { height: '100%', borderRadius: 2.5, backgroundColor: GAME_COLORS.mana },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  levelText: { color: '#ddaa22', fontSize: 11, fontWeight: '700' },
  goldText: { color: '#ffcc00', fontSize: 10, fontWeight: '600' },
  buffsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  buffIcon: { fontSize: 12 },
  itemsRow: { flexDirection: 'row', gap: 2, marginTop: 3, flexWrap: 'wrap' },
  itemIcon: { fontSize: 12, backgroundColor: '#1a2332', borderRadius: 4, width: 18, height: 18, textAlign: 'center', overflow: 'hidden' },
  shopBtn: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#2a4a2a', alignItems: 'center', justifyContent: 'center' },
  shopBtnText: { fontSize: 11 },
  joystickArea: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  joystickOuter: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  joystickInner: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  actionButtons: { alignItems: 'center', justifyContent: 'center' },
  attackBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#cc3333', borderWidth: 3, borderColor: '#ff5555', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  attackBtnIcon: { fontSize: 24 },
  abilityRow: { flexDirection: 'row', gap: 6 },
  abilityBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a3a5a', borderWidth: 2, borderColor: '#4488ff', alignItems: 'center', justifyContent: 'center' },
  abilityBtnDisabled: { opacity: 0.4, borderColor: '#2a3a4a' },
  abilityBtnIcon: { fontSize: 16 },
  abilityCdOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  abilityCdText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
