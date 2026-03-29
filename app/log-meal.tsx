import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { recognizeFoodFromImage, lookupFoodFromText } from '../lib/gemini';
import { insertMeal } from '../db/queries';
import { useStore } from '../store/useStore';
import { toDateString } from '../lib/dateUtils';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
type MealType = (typeof MEAL_TYPES)[number];

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '🍱 Lunch',
  dinner: '🌙 Dinner',
  snack: '🍎 Snack',
};

export default function LogMealScreen() {
  const { refreshMeals, selectedDate } = useStore();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('snack');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const pickImage = async (source: 'camera' | 'library') => {
    const pick =
      source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await pick({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: false,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await analyzeImage(uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    setAnalyzing(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const result = await recognizeFoodFromImage(base64);
      setName(result.name);
      setCalories(String(result.calories));
      setProtein(String(result.protein));
      setCarbs(String(result.carbs));
      setFat(String(result.fat));
    } catch (e: any) {
      Alert.alert(
        'Recognition Failed',
        e?.message ?? 'Could not identify food. Please fill in manually.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextLookup = async () => {
    if (!name.trim() || name.trim().length < 3) {
      Alert.alert('Enter a food', 'Type a food name first, e.g., "1 chicken breast" or "2 roti with dal"');
      return;
    }
    setLookingUp(true);
    try {
      const result = await lookupFoodFromText(name.trim());
      setName(result.name);
      setCalories(String(result.calories));
      setProtein(String(result.protein));
      setCarbs(String(result.carbs));
      setFat(String(result.fat));
    } catch (e: any) {
      Alert.alert('Lookup Failed', e?.message ?? 'Could not estimate nutrition. Please fill in manually.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a meal name.');
      return;
    }
    const cal = parseInt(calories, 10);
    if (!cal || cal <= 0) {
      Alert.alert('Validation', 'Please enter valid calories.');
      return;
    }

    insertMeal({
      name: name.trim(),
      calories: cal,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      meal_type: mealType,
      image_uri: imageUri,
      date: selectedDate,
    });

    refreshMeals();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Photo Section */}
        <View className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            📸 Identify with AI
          </Text>

          {imageUri ? (
            <View className="relative">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-44 rounded-2xl"
                resizeMode="cover"
              />
              {analyzing && (
                <View className="absolute inset-0 bg-black/40 rounded-2xl items-center justify-center">
                  <ActivityIndicator color="white" size="large" />
                  <Text className="text-white text-xs mt-2">Analyzing food...</Text>
                </View>
              )}
              <Pressable
                onPress={() => {
                  setImageUri(null);
                  setName('');
                  setCalories('');
                  setProtein('');
                  setCarbs('');
                  setFat('');
                }}
                className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1"
              >
                <Text className="text-white text-xs">✕ Clear</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => pickImage('camera')}
                className="flex-1 h-24 border-2 border-dashed border-green-300 rounded-2xl items-center justify-center bg-green-50"
              >
                <Text className="text-2xl">📷</Text>
                <Text className="text-xs text-green-700 font-medium mt-1">Take Photo</Text>
              </Pressable>
              <Pressable
                onPress={() => pickImage('library')}
                className="flex-1 h-24 border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center bg-gray-50"
              >
                <Text className="text-2xl">🖼️</Text>
                <Text className="text-xs text-gray-600 font-medium mt-1">From Library</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Meal Type */}
        <View className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Meal Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {MEAL_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-full border ${
                  mealType === type
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    mealType === type ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {MEAL_TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Meal Details */}
        <View className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Meal Details</Text>

          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">Name *</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., 1 chicken breast, 2 roti..."
                placeholderTextColor="#9ca3af"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50"
                onSubmitEditing={handleTextLookup}
                returnKeyType="search"
              />
              <Pressable
                onPress={handleTextLookup}
                disabled={lookingUp || !name.trim()}
                className={`px-3 rounded-xl items-center justify-center ${
                  lookingUp || !name.trim() ? 'bg-gray-200' : 'bg-green-600'
                }`}
              >
                {lookingUp ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-xs font-semibold">AI ✨</Text>
                )}
              </Pressable>
            </View>
            <Text className="text-xs text-gray-400 mt-1">
              Type a food and tap AI to auto-fill calories & macros
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">Calories *</Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g., 350"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50"
            />
          </View>

          {/* Macros Row */}
          <Text className="text-xs text-gray-500 mb-2">Macros (optional)</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-xs text-blue-500 mb-1">Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-amber-500 mb-1">Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-pink-500 mb-1">Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 bg-gray-50"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={analyzing || lookingUp}
          className={`rounded-2xl py-4 items-center ${analyzing || lookingUp ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          <Text className="text-white font-semibold text-base">
            {analyzing ? 'Analyzing...' : lookingUp ? 'Looking up...' : 'Save Meal'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
