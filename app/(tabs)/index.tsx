import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalorieRing from '../../components/CalorieRing';
import MacroBar from '../../components/MacroBar';
import MealCard from '../../components/MealCard';
import { useStore } from '../../store/useStore';
import { getMealSuggestions, MealSuggestion } from '../../lib/gemini';
import { formatDisplayDate } from '../../lib/dateUtils';

export default function HomeScreen() {
  const { meals, totals, dailyCalorieGoal, selectedDate, refreshMeals, userName } = useStore();
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshMeals();
    }, [])
  );

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const results = await getMealSuggestions(totals.calories, dailyCalorieGoal);
      setSuggestions(results);
    } catch {
      Alert.alert('Error', 'Could not fetch suggestions. Check your API key.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const remaining = dailyCalorieGoal - totals.calories;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <View>
            <Text className="text-xs text-gray-500">Hi {userName} 👋</Text>
            <Text className="text-lg font-bold text-gray-900">
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            className="w-9 h-9 rounded-full bg-white shadow-sm items-center justify-center"
          >
            <Text className="text-lg">⚙️</Text>
          </Pressable>
        </View>

        {/* Calorie Ring */}
        <View className="mx-5 mt-3 bg-white rounded-3xl p-5 shadow-sm items-center">
          <CalorieRing consumed={totals.calories} goal={dailyCalorieGoal} />
        </View>

        {/* Macro Summary */}
        <View className="mx-5 mt-3">
          <MacroBar
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
          />
        </View>

        {/* Meals */}
        <View className="mx-5 mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-gray-900">Meals</Text>
            <Text className="text-xs text-gray-500">{meals.length} logged</Text>
          </View>

          {meals.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
              <Text className="text-3xl mb-2">🍛</Text>
              <Text className="text-sm text-gray-500 text-center">
                No meals logged yet.{'\n'}Tap + to add your first meal.
              </Text>
            </View>
          ) : (
            meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
          )}
        </View>

        {/* Suggestions */}
        {remaining > 100 && (
          <View className="mx-5 mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-gray-900">Suggestions</Text>
              <Pressable onPress={fetchSuggestions} disabled={loadingSuggestions}>
                <Text className="text-xs text-green-600 font-medium">
                  {loadingSuggestions ? 'Loading...' : 'Refresh ↻'}
                </Text>
              </Pressable>
            </View>
            {loadingSuggestions && <ActivityIndicator color="#16a34a" />}
            {suggestions.map((s, i) => (
              <View key={i} className="bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <Text className="text-sm font-semibold text-gray-900 flex-1 mr-2">{s.name}</Text>
                  <Text className="text-sm font-bold text-green-600">{s.calories} kcal</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-0.5">{s.description}</Text>
              </View>
            ))}
            {!loadingSuggestions && suggestions.length === 0 && (
              <Pressable
                onPress={fetchSuggestions}
                className="bg-green-50 rounded-2xl p-4 items-center border border-green-100"
              >
                <Text className="text-green-700 text-sm font-medium">✨ Get AI Suggestions</Text>
                <Text className="text-green-600 text-xs mt-1">
                  {remaining} kcal remaining today
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - Log Meal */}
      <Pressable
        onPress={() => router.push('/log-meal')}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-green-600 items-center justify-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <Text className="text-white text-3xl leading-none font-light">+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
