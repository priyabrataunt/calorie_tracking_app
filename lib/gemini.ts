import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface FoodRecognitionResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

const FOOD_PROMPT = `You are a nutrition expert specializing in Indian and South Asian cuisine.
Analyze this food image and return a JSON object with the following fields:
- name: descriptive name of the food (e.g., "Dal Makhani", "Chicken Biryani (1 serving)")
- calories: estimated calories as an integer
- protein: estimated protein in grams (number)
- carbs: estimated carbohydrates in grams (number)
- fat: estimated fat in grams (number)
- notes: brief note about the estimate (e.g., "Estimated for 1 cup serving")
- confidence: "high", "medium", or "low"

Return ONLY valid JSON, no markdown, no explanation. Example:
{"name":"Dal Makhani","calories":320,"protein":14,"carbs":38,"fat":10,"notes":"Estimated for 1 cup","confidence":"high"}`;

export async function recognizeFoodFromImage(
  base64Image: string,
  mimeType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<FoodRecognitionResult> {
  if (!API_KEY) {
    throw new Error('Gemini API key not set. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: FOOD_PROMPT },
          { inlineData: { data: base64Image, mimeType } },
        ],
      },
    ],
  });

  const text = (response.text ?? '').trim();

  // Strip markdown code fences if present
  const jsonText = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  const parsed = JSON.parse(jsonText) as FoodRecognitionResult;
  return parsed;
}

const TEXT_LOOKUP_PROMPT = `You are a nutrition expert specializing in Indian and South Asian cuisine.
The user described a food item. Estimate its nutritional info.
Return a JSON object with these fields:
- name: cleaned-up name of the food (e.g., "Chicken Breast (1 piece, ~170g)")
- calories: estimated calories as an integer
- protein: estimated protein in grams (number)
- carbs: estimated carbohydrates in grams (number)
- fat: estimated fat in grams (number)
- notes: brief note about the estimate

Return ONLY valid JSON, no markdown, no explanation. Example:
{"name":"Chicken Breast (1 piece, ~170g)","calories":284,"protein":53,"carbs":0,"fat":6,"notes":"Skinless, boneless, grilled"}`;

export async function lookupFoodFromText(
  query: string
): Promise<Omit<FoodRecognitionResult, 'confidence'>> {
  if (!API_KEY) {
    throw new Error('Gemini API key not set. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${TEXT_LOOKUP_PROMPT}\nFood: ${query}`,
  });

  const text = (response.text ?? '').trim();
  const jsonText = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonText);
}

const SUGGESTION_PROMPT = `You are a nutrition expert specializing in Indian and South Asian cuisine.
The user has consumed {consumed} calories today out of their {goal} calorie goal.
They have {remaining} calories remaining.

Suggest 3 light, healthy Indian meal options that fit within the remaining calories.
Return a JSON array of objects with fields: name, calories, description.
Return ONLY valid JSON, no markdown.
Example: [{"name":"Dal with rice","calories":350,"description":"Light moong dal with 1 cup rice"}]`;

export interface MealSuggestion {
  name: string;
  calories: number;
  description: string;
}

export async function getMealSuggestions(
  consumed: number,
  goal: number
): Promise<MealSuggestion[]> {
  if (!API_KEY) return [];

  const remaining = goal - consumed;
  if (remaining < 100) return [];

  const prompt = SUGGESTION_PROMPT
    .replace('{consumed}', String(consumed))
    .replace('{goal}', String(goal))
    .replace('{remaining}', String(remaining));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = (response.text ?? '').trim();
  const jsonText = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonText) as MealSuggestion[];
}
