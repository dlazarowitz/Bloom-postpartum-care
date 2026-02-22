import { create } from 'zustand';
import {
  AppState,
  UserProfile,
  ChecklistItem,
  MoodEntry,
  FeedingEntry,
  DiaperEntry,
  SleepEntry,
  BabyMilestone,
  GroceryList,
  ChatSession,
  ChatMessage,
} from '../types';
import { v4 as uuid } from 'uuid';

interface AppStore extends AppState {
  // Profile
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Checklist
  toggleChecklistItem: (itemId: string) => void;
  setChecklist: (items: ChecklistItem[]) => void;

  // Mood
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;

  // Feeding
  addFeedingEntry: (entry: Omit<FeedingEntry, 'id'>) => void;

  // Diaper
  addDiaperEntry: (entry: Omit<DiaperEntry, 'id'>) => void;

  // Sleep
  addSleepEntry: (entry: Omit<SleepEntry, 'id'>) => void;
  updateSleepEntry: (id: string, updates: Partial<SleepEntry>) => void;

  // Milestones
  toggleMilestone: (id: string) => void;
  setMilestones: (milestones: BabyMilestone[]) => void;

  // Grocery
  addGroceryList: (list: Omit<GroceryList, 'id'>) => void;
  removeGroceryList: (id: string) => void;

  // Chat
  createChatSession: (title: string) => string;
  addChatMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  deleteChatSession: (sessionId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  profile: {
    name: '',
    onboardingComplete: false,
  },
  checklist: [],
  moodEntries: [],
  feedingEntries: [],
  diaperEntries: [],
  sleepEntries: [],
  milestones: [],
  groceryLists: [],
  chatSessions: [],
  selectedMealPlan: undefined,

  // Profile
  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  // Checklist
  toggleChecklistItem: (itemId) =>
    set((state) => ({
      checklist: state.checklist.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    })),

  setChecklist: (items) => set({ checklist: items }),

  // Mood
  addMoodEntry: (entry) =>
    set((state) => ({
      moodEntries: [{ ...entry, id: uuid() }, ...state.moodEntries],
    })),

  // Feeding
  addFeedingEntry: (entry) =>
    set((state) => ({
      feedingEntries: [{ ...entry, id: uuid() }, ...state.feedingEntries],
    })),

  // Diaper
  addDiaperEntry: (entry) =>
    set((state) => ({
      diaperEntries: [{ ...entry, id: uuid() }, ...state.diaperEntries],
    })),

  // Sleep
  addSleepEntry: (entry) =>
    set((state) => ({
      sleepEntries: [{ ...entry, id: uuid() }, ...state.sleepEntries],
    })),

  updateSleepEntry: (id, updates) =>
    set((state) => ({
      sleepEntries: state.sleepEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    })),

  // Milestones
  toggleMilestone: (id) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id
          ? {
              ...m,
              achieved: !m.achieved,
              achievedDate: !m.achieved ? new Date().toISOString() : undefined,
            }
          : m
      ),
    })),

  setMilestones: (milestones) => set({ milestones }),

  // Grocery
  addGroceryList: (list) =>
    set((state) => ({
      groceryLists: [{ ...list, id: uuid() }, ...state.groceryLists],
    })),

  removeGroceryList: (id) =>
    set((state) => ({
      groceryLists: state.groceryLists.filter((l) => l.id !== id),
    })),

  // Chat
  createChatSession: (title) => {
    const id = uuid();
    set((state) => ({
      chatSessions: [
        {
          id,
          title,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.chatSessions,
      ],
    }));
    return id;
  },

  addChatMessage: (sessionId, message) =>
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: [
                ...session.messages,
                {
                  ...message,
                  id: uuid(),
                  timestamp: new Date().toISOString(),
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : session
      ),
    })),

  deleteChatSession: (sessionId) =>
    set((state) => ({
      chatSessions: state.chatSessions.filter((s) => s.id !== sessionId),
    })),
}));
