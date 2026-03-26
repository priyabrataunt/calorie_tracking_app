import { create } from 'zustand';
import { Meal, getMealsForDate, deleteMeal as dbDeleteMeal, getDailyTotals, getSetting, setSetting } from '../db/queries';
import { toDateString } from '../lib/dateUtils';

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AppState {
  // Settings
  dailyCalorieGoal: number;
  userName: string;

  // Today's data
  selectedDate: string;
  meals: Meal[];
  totals: DailyTotals;

  // Actions
  loadSettings: () => void;
  setDailyCalorieGoal: (goal: number) => void;
  setUserName: (name: string) => void;

  setSelectedDate: (date: string) => void;
  refreshMeals: () => void;
  deleteMeal: (id: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  dailyCalorieGoal: 2000,
  userName: 'User',
  selectedDate: toDateString(),
  meals: [],
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },

  loadSettings: () => {
    const goal = getSetting('daily_calorie_goal');
    const name = getSetting('name');
    set({
      dailyCalorieGoal: goal ? parseInt(goal, 10) : 2000,
      userName: name ?? 'User',
    });
  },

  setDailyCalorieGoal: (goal: number) => {
    setSetting('daily_calorie_goal', String(goal));
    set({ dailyCalorieGoal: goal });
  },

  setUserName: (name: string) => {
    setSetting('name', name);
    set({ userName: name });
  },

  setSelectedDate: (date: string) => {
    const meals = getMealsForDate(date);
    const totals = getDailyTotals(date);
    set({ selectedDate: date, meals, totals });
  },

  refreshMeals: () => {
    const { selectedDate } = get();
    const meals = getMealsForDate(selectedDate);
    const totals = getDailyTotals(selectedDate);
    set({ meals, totals });
  },

  deleteMeal: (id: number) => {
    dbDeleteMeal(id);
    get().refreshMeals();
  },
}));
