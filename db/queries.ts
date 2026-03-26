import { getDb } from './schema';

export interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  image_uri: string | null;
  notes: string | null;
  date: string;
  created_at: number;
}

export interface NewMeal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_type?: string;
  image_uri?: string | null;
  notes?: string | null;
  date: string;
}

export function getMealsForDate(date: string): Meal[] {
  const db = getDb();
  return db.getAllSync<Meal>(
    'SELECT * FROM meals WHERE date = ? ORDER BY created_at ASC',
    [date]
  );
}

export function insertMeal(meal: NewMeal): number {
  const db = getDb();
  const result = db.runSync(
    `INSERT INTO meals (name, calories, protein, carbs, fat, meal_type, image_uri, notes, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      meal.name,
      meal.calories,
      meal.protein ?? 0,
      meal.carbs ?? 0,
      meal.fat ?? 0,
      meal.meal_type ?? 'snack',
      meal.image_uri ?? null,
      meal.notes ?? null,
      meal.date,
      Date.now(),
    ]
  );
  return result.lastInsertRowId;
}

export function deleteMeal(id: number): void {
  const db = getDb();
  db.runSync('DELETE FROM meals WHERE id = ?', [id]);
}

export function getDailyTotals(date: string): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const db = getDb();
  const row = db.getFirstSync<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>(
    `SELECT
      COALESCE(SUM(calories), 0) as calories,
      COALESCE(SUM(protein), 0) as protein,
      COALESCE(SUM(carbs), 0) as carbs,
      COALESCE(SUM(fat), 0) as fat
     FROM meals WHERE date = ?`,
    [date]
  );
  return row ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export function getWeeklyCalories(startDate: string, endDate: string): { date: string; calories: number }[] {
  const db = getDb();
  return db.getAllSync<{ date: string; calories: number }>(
    `SELECT date, COALESCE(SUM(calories), 0) as calories
     FROM meals
     WHERE date >= ? AND date <= ?
     GROUP BY date
     ORDER BY date ASC`,
    [startDate, endDate]
  );
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.getFirstSync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.runSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}
