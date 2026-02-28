/**
 * Notification & Reminder Service
 *
 * Provides scheduling and management of local push notifications
 * for feeding reminders, mood check-ins, medication reminders,
 * and milestone alerts.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type ReminderType =
  | 'feeding'
  | 'mood_checkin'
  | 'medication'
  | 'milestone'
  | 'appointment'
  | 'hydration';

interface ReminderConfig {
  type: ReminderType;
  title: string;
  body: string;
  intervalMinutes?: number;
  hour?: number;
  minute?: number;
  repeats?: boolean;
}

/**
 * Request notification permissions from the user.
 * Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Bloom Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

/**
 * Schedule a one-time notification after a delay.
 */
export async function scheduleDelayedNotification(
  title: string,
  body: string,
  delaySeconds: number,
  data?: Record<string, string>,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });
}

/**
 * Schedule a daily notification at a specific time.
 */
export async function scheduleDailyReminder(
  config: ReminderConfig,
): Promise<string> {
  const { title, body, hour = 9, minute = 0 } = config;

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: config.type },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Schedule a feeding reminder that repeats at an interval.
 */
export async function scheduleFeedingReminder(
  intervalMinutes: number,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Feeding Reminder',
      body: `It's been ${intervalMinutes} minutes since the last feeding. Time to feed baby?`,
      data: { type: 'feeding' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });
}

/**
 * Cancel a specific scheduled notification by ID.
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all currently scheduled notifications.
 */
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Pre-built reminder presets
export const REMINDER_PRESETS: Record<string, ReminderConfig> = {
  morningMoodCheckin: {
    type: 'mood_checkin',
    title: 'Good Morning 🌸',
    body: 'How are you feeling today? Take a moment to check in with yourself.',
    hour: 9,
    minute: 0,
    repeats: true,
  },
  eveningMoodCheckin: {
    type: 'mood_checkin',
    title: 'Evening Check-In',
    body: "How was your day? A quick mood check helps track patterns over time.",
    hour: 20,
    minute: 0,
    repeats: true,
  },
  hydrationReminder: {
    type: 'hydration',
    title: 'Stay Hydrated 💧',
    body: 'Remember to drink water! Staying hydrated is especially important for recovery and milk supply.',
    intervalMinutes: 120,
    repeats: true,
  },
  prenatalVitamin: {
    type: 'medication',
    title: 'Vitamin Reminder',
    body: "Don't forget to take your prenatal vitamin today!",
    hour: 8,
    minute: 30,
    repeats: true,
  },
};
