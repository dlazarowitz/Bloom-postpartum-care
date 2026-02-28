import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../../src/utils/theme';
import { useAppStore } from '../../src/store/useAppStore';
import { sendChat } from '../../src/services/api';
import type { ProviderSpecialty, CareTeamMember } from '../../src/types';

// ---------------------------------------------------------------------------
// Constants & Mappings
// ---------------------------------------------------------------------------

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SpecialtyConfig {
  label: string;
  color: string;
  icon: IoniconsName;
}

const SPECIALTY_MAP: Record<ProviderSpecialty, SpecialtyConfig> = {
  obgyn: { label: 'OB/GYN', color: '#D4869C', icon: 'woman' },
  pediatrician: { label: 'Pediatrician', color: '#6B9FD4', icon: 'happy' },
  lactation_consultant: {
    label: 'Lactation Consultant',
    color: '#6AAF7D',
    icon: 'nutrition',
  },
  therapist: { label: 'Therapist', color: '#8B7EC8', icon: 'bulb' },
  doula: { label: 'Doula', color: '#D4869C', icon: 'heart' },
  midwife: { label: 'Midwife', color: '#4AAFB8', icon: 'medkit' },
  pelvic_floor_pt: {
    label: 'Pelvic Floor PT',
    color: '#D4A76A',
    icon: 'fitness',
  },
  other: { label: 'Other', color: '#9E9893', icon: 'person' },
};

const ALL_SPECIALTIES: ProviderSpecialty[] = [
  'obgyn',
  'pediatrician',
  'lactation_consultant',
  'therapist',
  'doula',
  'midwife',
  'pelvic_floor_pt',
  'other',
];

const EMPTY_FORM: Omit<CareTeamMember, 'id'> = {
  name: '',
  specialty: 'obgyn',
  phone: '',
  email: '',
  clinic: '',
  address: '',
  notes: '',
  nextAppointment: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CareTeamScreen() {
  const { colors } = useTheme();
  const careTeam = useAppStore((s) => s.careTeam);
  const addCareTeamMember = useAppStore((s) => s.addCareTeamMember);
  const updateCareTeamMember = useAppStore((s) => s.updateCareTeamMember);
  const removeCareTeamMember = useAppStore((s) => s.removeCareTeamMember);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CareTeamMember, 'id'>>({ ...EMPTY_FORM });
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // -- helpers ---------------------------------------------------------------

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setShowAddForm(false);
    setEditingId(null);
    setShowSpecialtyPicker(false);
  }, []);

  const handleCall = useCallback((phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'This provider does not have a phone number on file.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleText = useCallback((phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'This provider does not have a phone number on file.');
      return;
    }
    Linking.openURL(`sms:${phone}`);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Name Required', 'Please enter the provider name.');
      return;
    }
    if (editingId) {
      updateCareTeamMember(editingId, form);
    } else {
      addCareTeamMember(form);
    }
    resetForm();
  }, [form, editingId, addCareTeamMember, updateCareTeamMember, resetForm]);

  const handleEdit = useCallback((member: CareTeamMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      specialty: member.specialty,
      phone: member.phone || '',
      email: member.email || '',
      clinic: member.clinic || '',
      address: member.address || '',
      notes: member.notes || '',
      nextAppointment: member.nextAppointment || '',
    });
    setShowAddForm(true);
  }, []);

  const handleRemove = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        'Remove Provider',
        `Are you sure you want to remove ${name} from your care team?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              removeCareTeamMember(id);
              if (editingId === id) resetForm();
            },
          },
        ],
      );
    },
    [removeCareTeamMember, editingId, resetForm],
  );

  const handleAutoFill = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert('Name Required', 'Please enter the provider name first so AI can look them up.');
      return;
    }
    setAiLoading(true);
    try {
      const specialtyLabel = SPECIALTY_MAP[form.specialty].label;
      const response = await sendChat({
        messages: [
          {
            role: 'user',
            content: `I need contact information for ${form.name.trim()}, a ${specialtyLabel}. Please provide their phone number, clinic name, and address if you can find it. Return ONLY a JSON object with keys: phone, clinic, address. If unknown, use empty string. No other text.`,
          },
        ],
      });

      // Try to parse JSON from the response
      const text = response.message.trim();
      // Find JSON object in response (may be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setForm((prev) => ({
          ...prev,
          phone: data.phone || prev.phone,
          clinic: data.clinic || prev.clinic,
          address: data.address || prev.address,
        }));
      } else {
        Alert.alert('AI Response', 'Could not parse provider information. Please fill in manually.');
      }
    } catch (error) {
      Alert.alert(
        'AI Unavailable',
        'Could not reach the AI assistant. Please fill in the details manually.',
      );
    } finally {
      setAiLoading(false);
    }
  }, [form.name, form.specialty]);

  // -- dynamic styles --------------------------------------------------------

  const dynamicStyles = getDynamicStyles(colors);

  // -- render: empty state ---------------------------------------------------

  if (careTeam.length === 0 && !showAddForm) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>My Care Team</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Your postpartum support network
            </Text>
          </View>

          <View style={[styles.emptyStateCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: colors.primaryBg },
              ]}
            >
              <Ionicons name="people" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Build Your Care Team
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Keep all your postpartum providers in one place. Add your OB/GYN, pediatrician,
              lactation consultant, therapist, and more.
            </Text>

            <View style={[styles.emptyAiHint, { backgroundColor: colors.secondaryBg }]}>
              <Ionicons name="sparkles" size={20} color={colors.secondary} />
              <Text style={[styles.emptyAiHintText, { color: colors.secondaryDark }]}>
                Tip: Use the "Auto-fill with AI" button to automatically look up provider contact
                information when adding a new member.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.emptyAddButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddForm(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color={colors.textOnPrimary} />
              <Text style={[styles.emptyAddButtonText, { color: colors.textOnPrimary }]}>
                Add Your First Provider
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Render add form as overlay when toggled from empty state */}
        {showAddForm && renderAddForm(dynamicStyles, colors)}
      </SafeAreaView>
    );
  }

  // -- render: populated state -----------------------------------------------

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>My Care Team</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Your postpartum support network
            </Text>
          </View>

          {/* Provider Cards */}
          {careTeam.map((member) => {
            const spec = SPECIALTY_MAP[member.specialty];
            return (
              <View
                key={member.id}
                style={[
                  styles.providerCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                  },
                  shadows.md,
                ]}
              >
                {/* Top row: name + specialty badge */}
                <View style={styles.providerTopRow}>
                  <View style={styles.providerNameSection}>
                    <View
                      style={[
                        styles.providerIconCircle,
                        { backgroundColor: spec.color + '20' },
                      ]}
                    >
                      <Ionicons name={spec.icon} size={22} color={spec.color} />
                    </View>
                    <View style={styles.providerNameBlock}>
                      <Text style={[styles.providerName, { color: colors.text }]}>
                        {member.name}
                      </Text>
                      <View style={[styles.specialtyBadge, { backgroundColor: spec.color + '18' }]}>
                        <Text style={[styles.specialtyBadgeText, { color: spec.color }]}>
                          {spec.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Clinic */}
                {member.clinic ? (
                  <View style={styles.providerDetailRow}>
                    <Ionicons name="business" size={15} color={colors.textMuted} />
                    <Text style={[styles.providerDetailText, { color: colors.textSecondary }]}>
                      {member.clinic}
                    </Text>
                  </View>
                ) : null}

                {/* Address */}
                {member.address ? (
                  <View style={styles.providerDetailRow}>
                    <Ionicons name="location" size={15} color={colors.textMuted} />
                    <Text style={[styles.providerDetailText, { color: colors.textSecondary }]}>
                      {member.address}
                    </Text>
                  </View>
                ) : null}

                {/* Email */}
                {member.email ? (
                  <View style={styles.providerDetailRow}>
                    <Ionicons name="mail" size={15} color={colors.textMuted} />
                    <Text style={[styles.providerDetailText, { color: colors.textSecondary }]}>
                      {member.email}
                    </Text>
                  </View>
                ) : null}

                {/* Next Appointment */}
                {member.nextAppointment ? (
                  <View style={[styles.appointmentRow, { backgroundColor: colors.primaryBg }]}>
                    <Ionicons name="calendar" size={15} color={colors.primary} />
                    <Text style={[styles.appointmentText, { color: colors.primaryDark }]}>
                      Next appointment: {member.nextAppointment}
                    </Text>
                  </View>
                ) : null}

                {/* Notes */}
                {member.notes ? (
                  <View style={[styles.notesRow, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.notesLabel, { color: colors.textMuted }]}>Notes</Text>
                    <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                      {member.notes}
                    </Text>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#6AAF7D18' }]}
                    onPress={() => handleCall(member.phone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={18} color="#6AAF7D" />
                    <Text style={[styles.actionButtonText, { color: '#6AAF7D' }]}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#6B9FD418' }]}
                    onPress={() => handleText(member.phone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble" size={18} color="#6B9FD4" />
                    <Text style={[styles.actionButtonText, { color: '#6B9FD4' }]}>Text</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.accent + '18' }]}
                    onPress={() => handleEdit(member)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create" size={18} color={colors.accent} />
                    <Text style={[styles.actionButtonText, { color: colors.accent }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '18' }]}
                    onPress={() => handleRemove(member.id, member.name)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={18} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Add Provider Section */}
          {!showAddForm ? (
            <TouchableOpacity
              style={[
                styles.addProviderButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => {
                setForm({ ...EMPTY_FORM });
                setEditingId(null);
                setShowAddForm(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color={colors.textOnPrimary} />
              <Text style={[styles.addProviderButtonText, { color: colors.textOnPrimary }]}>
                Add Provider
              </Text>
            </TouchableOpacity>
          ) : (
            renderAddForm(dynamicStyles, colors)
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  // -- render helpers --------------------------------------------------------

  function renderAddForm(ds: ReturnType<typeof getDynamicStyles>, clr: typeof colors) {
    return (
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: clr.surface,
            borderColor: clr.borderLight,
          },
          shadows.lg,
        ]}
      >
        <View style={styles.formHeader}>
          <Text style={[styles.formTitle, { color: clr.text }]}>
            {editingId ? 'Edit Provider' : 'Add Provider'}
          </Text>
          <TouchableOpacity onPress={resetForm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={26} color={clr.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text style={[styles.fieldLabel, { color: clr.textSecondary }]}>Name *</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: clr.surfaceSecondary,
              borderColor: clr.border,
              color: clr.text,
            },
          ]}
          placeholder="Dr. Jane Smith"
          placeholderTextColor={clr.textMuted}
          value={form.name}
          onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
        />

        {/* Specialty Picker */}
        <Text style={[styles.fieldLabel, { color: clr.textSecondary }]}>Specialty</Text>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            {
              backgroundColor: clr.surfaceSecondary,
              borderColor: clr.border,
            },
          ]}
          onPress={() => setShowSpecialtyPicker((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={styles.pickerButtonInner}>
            <Ionicons
              name={SPECIALTY_MAP[form.specialty].icon}
              size={18}
              color={SPECIALTY_MAP[form.specialty].color}
            />
            <Text style={[styles.pickerButtonText, { color: clr.text }]}>
              {SPECIALTY_MAP[form.specialty].label}
            </Text>
          </View>
          <Ionicons
            name={showSpecialtyPicker ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={clr.textMuted}
          />
        </TouchableOpacity>

        {showSpecialtyPicker && (
          <View
            style={[
              styles.specialtyGrid,
              { backgroundColor: clr.surfaceSecondary, borderColor: clr.border },
            ]}
          >
            {ALL_SPECIALTIES.map((key) => {
              const spec = SPECIALTY_MAP[key];
              const isSelected = form.specialty === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.specialtyOption,
                    {
                      backgroundColor: isSelected ? spec.color + '20' : 'transparent',
                      borderColor: isSelected ? spec.color : clr.borderLight,
                    },
                  ]}
                  onPress={() => {
                    setForm((p) => ({ ...p, specialty: key }));
                    setShowSpecialtyPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={spec.icon} size={16} color={spec.color} />
                  <Text
                    style={[
                      styles.specialtyOptionText,
                      { color: isSelected ? spec.color : clr.text },
                    ]}
                  >
                    {spec.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Phone */}
        <Text style={[styles.fieldLabel, { color: clr.textSecondary }]}>Phone</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: clr.surfaceSecondary,
              borderColor: clr.border,
              color: clr.text,
            },
          ]}
          placeholder="(555) 123-4567"
          placeholderTextColor={clr.textMuted}
          value={form.phone}
          onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
          keyboardType="phone-pad"
        />

        {/* Email */}
        <Text style={[styles.fieldLabel, { color: clr.textSecondary }]}>Email</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: clr.surfaceSecondary,
              borderColor: clr.border,
              color: clr.text,
            },
          ]}
          placeholder="doctor@clinic.com"
          placeholderTextColor={clr.textMuted}
          value={form.email}
          onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Clinic */}
        <Text style={[styles.fieldLabel, { color: clr.textSecondary }]}>Clinic</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: clr.surfaceSecondary,
              borderColor: clr.border,
              color: clr.text,
            },
          ]}
          placeholder="Sunnyvale Women's Health"
          placeholderTextColor={clr.textMuted}
          value={form.clinic}
          onChangeText={(v) => setForm((p) => ({ ...p, clinic: v }))}
        />

        {/* Notes */}
        <Text style={[styles.fieldLabel, { color: clr.textSecondary }]}>Notes</Text>
        <TextInput
          style={[
            styles.textInput,
            styles.textInputMultiline,
            {
              backgroundColor: clr.surfaceSecondary,
              borderColor: clr.border,
              color: clr.text,
            },
          ]}
          placeholder="Office hours, preferred contact method, etc."
          placeholderTextColor={clr.textMuted}
          value={form.notes}
          onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* AI Auto-fill */}
        <TouchableOpacity
          style={[
            styles.aiFillButton,
            {
              backgroundColor: clr.secondaryBg,
              borderColor: clr.secondary,
            },
          ]}
          onPress={handleAutoFill}
          disabled={aiLoading}
          activeOpacity={0.7}
        >
          {aiLoading ? (
            <ActivityIndicator size="small" color={clr.secondary} />
          ) : (
            <Ionicons name="sparkles" size={18} color={clr.secondary} />
          )}
          <Text style={[styles.aiFillButtonText, { color: clr.secondaryDark }]}>
            {aiLoading ? 'Looking up provider...' : 'Auto-fill with AI'}
          </Text>
        </TouchableOpacity>

        {/* Save / Cancel */}
        <View style={styles.formActionRow}>
          <TouchableOpacity
            style={[styles.formCancelButton, { borderColor: clr.border }]}
            onPress={resetForm}
            activeOpacity={0.7}
          >
            <Text style={[styles.formCancelText, { color: clr.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.formSaveButton, { backgroundColor: clr.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color={clr.textOnPrimary} />
            <Text style={[styles.formSaveText, { color: clr.textOnPrimary }]}>
              {editingId ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// ---------------------------------------------------------------------------
// Dynamic styles that depend on theme colors (used sparingly)
// ---------------------------------------------------------------------------

function getDynamicStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    colors,
  };
}

// ---------------------------------------------------------------------------
// Static styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + 32,
  },
  emptyContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },

  // -- Header ----------------------------------------------------------------
  headerSection: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
  },

  // -- Empty State -----------------------------------------------------------
  emptyStateCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyAiHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  emptyAiHintText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  emptyAddButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },

  // -- Provider Card ---------------------------------------------------------
  providerCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  providerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  providerNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  providerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerNameBlock: {
    flex: 1,
  },
  providerName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  specialtyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  specialtyBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  providerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  providerDetailText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  appointmentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  notesRow: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  notesLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  notesText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  // -- Action Row ------------------------------------------------------------
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  // -- Add Provider Button ---------------------------------------------------
  addProviderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addProviderButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },

  // -- Add / Edit Form -------------------------------------------------------
  formCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
  },
  textInputMultiline: {
    minHeight: 72,
    paddingTop: spacing.sm + 2,
  },

  // -- Specialty Picker ------------------------------------------------------
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  pickerButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pickerButtonText: {
    fontSize: fontSize.md,
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  specialtyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  specialtyOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // -- AI Auto-fill Button ---------------------------------------------------
  aiFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  aiFillButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  // -- Form Action Row -------------------------------------------------------
  formActionRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  formCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  formCancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  formSaveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  formSaveText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
