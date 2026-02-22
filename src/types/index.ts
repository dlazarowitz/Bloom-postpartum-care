// ============================================================
// Bloom Postpartum Care - Core Type Definitions
// ============================================================

// --- Recovery Types ---

export type DeliveryType = 'vaginal' | 'csection';

export type RecoveryPhase = 'immediate' | 'early' | 'ongoing' | 'longterm';

export interface RecoveryTip {
  id: string;
  title: string;
  description: string;
  phase: RecoveryPhase;
  icon: string;
  warning?: string;
}

export interface RecoveryMilestone {
  id: string;
  weekRange: string;
  title: string;
  description: string;
  tips: RecoveryTip[];
  whenToCallDoctor: string[];
}

export interface RecoveryGuide {
  type: DeliveryType;
  title: string;
  overview: string;
  milestones: RecoveryMilestone[];
  doList: string[];
  dontList: string[];
}

// --- Checklist Types ---

export type ChecklistCategory =
  | 'feeding'
  | 'diapering'
  | 'sleeping'
  | 'bathing'
  | 'clothing'
  | 'health'
  | 'travel'
  | 'nursery'
  | 'postpartum_mom';

export interface ChecklistItem {
  id: string;
  name: string;
  category: ChecklistCategory;
  description: string;
  quantity: number;
  priority: 'essential' | 'recommended' | 'nice_to_have';
  checked: boolean;
  estimatedCost?: string;
  notes?: string;
}

export interface ChecklistSection {
  category: ChecklistCategory;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

// --- Meal Planning / Recipe Types ---

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: 'produce' | 'protein' | 'dairy' | 'grains' | 'pantry' | 'frozen' | 'other';
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  benefits: string[];
  ingredients: Ingredient[];
  instructions: string[];
  nutritionHighlights: string[];
  image?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  days: MealPlanDay[];
}

export interface MealPlanDay {
  day: string;
  breakfast: string; // recipe ID
  lunch: string;
  dinner: string;
  snacks: string[];
}

// --- Grocery Store Types ---

export interface GroceryStore {
  id: string;
  name: string;
  logo: string;
  color: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  onlineOrderUrl: string;
}

export interface GroceryList {
  id: string;
  name: string;
  store: string;
  items: GroceryItem[];
  createdAt: string;
}

export interface GroceryItem {
  ingredient: Ingredient;
  recipeIds: string[];
  checked: boolean;
}

// --- Chat / AI Assistant Types ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// --- Baby Tracker Types ---

export type FeedingType = 'breast_left' | 'breast_right' | 'bottle' | 'formula' | 'solid';

export interface FeedingEntry {
  id: string;
  type: FeedingType;
  startTime: string;
  endTime?: string;
  amount?: number;
  unit?: 'oz' | 'ml';
  notes?: string;
}

export interface DiaperEntry {
  id: string;
  time: string;
  type: 'wet' | 'dirty' | 'both';
  notes?: string;
}

export interface SleepEntry {
  id: string;
  startTime: string;
  endTime?: string;
  quality?: 'good' | 'fair' | 'poor';
  notes?: string;
}

export interface BabyMilestone {
  id: string;
  title: string;
  description: string;
  ageRangeWeeks: [number, number];
  category: 'motor' | 'cognitive' | 'social' | 'language';
  achieved: boolean;
  achievedDate?: string;
}

// --- Mood / Mental Health Types ---

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  feelings: string[];
  notes?: string;
  sleepHours?: number;
  selfCareActivities?: string[];
}

export interface PPDScreeningQuestion {
  id: string;
  question: string;
  options: { label: string; score: number }[];
}

export interface PPDScreeningResult {
  id: string;
  date: string;
  totalScore: number;
  answers: { questionId: string; score: number }[];
  recommendation: string;
}

// --- App State Types ---

export interface UserProfile {
  name: string;
  babyName?: string;
  babyBirthDate?: string;
  deliveryType?: DeliveryType;
  onboardingComplete: boolean;
}

export interface AppState {
  profile: UserProfile;
  checklist: ChecklistItem[];
  moodEntries: MoodEntry[];
  feedingEntries: FeedingEntry[];
  diaperEntries: DiaperEntry[];
  sleepEntries: SleepEntry[];
  milestones: BabyMilestone[];
  groceryLists: GroceryList[];
  chatSessions: ChatSession[];
  selectedMealPlan?: string;
}
