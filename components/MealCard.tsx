import React from 'react';
import { View, Text, Pressable, Alert, Image } from 'react-native';
import { Meal } from '../db/queries';
import { useStore } from '../store/useStore';

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '🍱',
  dinner: '🌙',
  snack: '🍎',
};

interface Props {
  meal: Meal;
}

export default function MealCard({ meal }: Props) {
  const deleteMeal = useStore((s) => s.deleteMeal);

  const handleDelete = () => {
    Alert.alert('Delete Meal', `Remove "${meal.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMeal(meal.id),
      },
    ]);
  };

  const icon = MEAL_TYPE_ICONS[meal.meal_type] ?? '🍽️';

  return (
    <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm">
      {meal.image_uri ? (
        <Image
          source={{ uri: meal.image_uri }}
          className="w-12 h-12 rounded-xl mr-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-12 h-12 rounded-xl bg-green-50 items-center justify-center mr-3">
          <Text className="text-2xl">{icon}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {meal.name}
        </Text>
        <Text className="text-xs text-gray-500 capitalize mt-0.5">{meal.meal_type}</Text>
        {(meal.protein > 0 || meal.carbs > 0 || meal.fat > 0) && (
          <Text className="text-xs text-gray-400 mt-0.5">
            P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
          </Text>
        )}
      </View>
      <View className="items-end ml-2">
        <Text className="text-sm font-bold text-green-600">{meal.calories} kcal</Text>
        <Pressable onPress={handleDelete} className="mt-1 p-1">
          <Text className="text-xs text-red-400">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}
