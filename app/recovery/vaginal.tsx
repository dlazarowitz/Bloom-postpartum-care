import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { vaginalRecoveryGuide } from '../../src/data/recovery-vaginal';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function VaginalRecoveryScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const guide = vaginalRecoveryGuide;
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(guide.milestones[0]?.id ?? null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>{guide.overview}</Text>
        </View>

        {/* Timeline Milestones */}
        <Text style={styles.sectionTitle}>Recovery Timeline</Text>
        {guide.milestones.map((milestone) => {
          const isExpanded = expandedMilestone === milestone.id;
          return (
            <View key={milestone.id} style={styles.milestoneCard}>
              <TouchableOpacity
                style={styles.milestoneHeader}
                onPress={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                activeOpacity={0.7}
              >
                <View style={styles.milestoneHeaderLeft}>
                  <View style={styles.weekBadge}>
                    <Text style={styles.weekBadgeText}>{milestone.weekRange}</Text>
                  </View>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                </View>
                <Ionicons
                  name={(isExpanded ? 'chevron-up' : 'chevron-down') as IoniconsName}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.milestoneBody}>
                  <Text style={styles.milestoneDescription}>{milestone.description}</Text>

                  {milestone.tips.map((tip) => (
                    <View key={tip.id} style={styles.tipCard}>
                      <View style={styles.tipHeader}>
                        <Ionicons name={(tip.icon || 'information-circle') as IoniconsName} size={20} color={colors.primary} />
                        <Text style={styles.tipTitle}>{tip.title}</Text>
                      </View>
                      <Text style={styles.tipDescription}>{tip.description}</Text>
                      {tip.warning && (
                        <View style={styles.warningBox}>
                          <Ionicons name="warning" size={16} color={colors.warning} />
                          <Text style={styles.warningText}>{tip.warning}</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {/* When to call doctor */}
                  <View style={styles.doctorCard}>
                    <View style={styles.doctorHeader}>
                      <Ionicons name="call" size={18} color={colors.error} />
                      <Text style={styles.doctorTitle}>When to Call Your Provider</Text>
                    </View>
                    {milestone.whenToCallDoctor.map((item, idx) => (
                      <View key={idx} style={styles.doctorItem}>
                        <Text style={styles.doctorBullet}>!</Text>
                        <Text style={styles.doctorText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Do / Don't Lists */}
        <Text style={styles.sectionTitle}>Recovery Do's</Text>
        <View style={styles.listCard}>
          {guide.doList.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recovery Don'ts</Text>
        <View style={styles.listCard}>
          {guide.dontList.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Ionicons name="close-circle" size={18} color={colors.error} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    overviewCard: {
      backgroundColor: colors.primaryBg,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    overviewText: { fontSize: fontSize.md, color: colors.text, lineHeight: 24 },
    sectionTitle: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    milestoneCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...shadows.md,
      overflow: 'hidden',
    },
    milestoneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
    },
    milestoneHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    weekBadge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    weekBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textOnPrimary },
    milestoneTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
    milestoneBody: { padding: spacing.md, paddingTop: 0 },
    milestoneDescription: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
    tipCard: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    tipHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
    tipTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
    tipDescription: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: colors.warning + '15',
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
    warningText: { fontSize: fontSize.sm, color: colors.text, flex: 1, lineHeight: 18 },
    doctorCard: {
      backgroundColor: colors.error + '10',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    doctorHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    doctorTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.error },
    doctorItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
    doctorBullet: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.error, width: 16, textAlign: 'center' },
    doctorText: { fontSize: fontSize.sm, color: colors.text, flex: 1, lineHeight: 20 },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
    listText: { fontSize: fontSize.md, color: colors.text, flex: 1, lineHeight: 22 },
    bottomSpacer: { height: spacing.xxl },
  });
}
