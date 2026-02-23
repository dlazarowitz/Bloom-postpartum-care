import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TutorialStep } from '../../src/game/types';
import { GAME_COLORS } from '../../src/game/data';

interface TutorialOverlayProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const ACTION_HINTS: Record<string, string> = {
  move: 'Try using the joystick now!',
  attack: 'Tap the attack button!',
  ability: 'Use an ability!',
  shop: 'Open the shop near your base!',
  objective: 'Push toward enemy turrets!',
  complete: 'You\'re all set!',
};

export default function TutorialOverlay({ step, stepIndex, totalSteps, onNext, onSkip }: TutorialOverlayProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.stepIndicator}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <View key={i} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.message}>{step.message}</Text>
        <Text style={styles.hint}>{ACTION_HINTS[step.action]}</Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipBtnText}>Skip Tutorial</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
            <Text style={styles.nextBtnText}>
              {step.action === 'complete' ? 'Start Playing!' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 170,
    left: 16,
    right: 16,
    zIndex: 60,
  },
  panel: {
    backgroundColor: 'rgba(10, 14, 20, 0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4488ff',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a3a4a',
  },
  dotActive: {
    backgroundColor: '#4488ff',
  },
  title: {
    color: GAME_COLORS.ui.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: GAME_COLORS.ui.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  hint: {
    color: '#ffaa44',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipBtnText: {
    color: GAME_COLORS.ui.textDim,
    fontSize: 13,
  },
  nextBtn: {
    backgroundColor: '#4488ff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
