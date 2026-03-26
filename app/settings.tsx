import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';

export default function SettingsScreen() {
  const { dailyCalorieGoal, userName, setDailyCalorieGoal, setUserName } = useStore();

  const [goalInput, setGoalInput] = useState(String(dailyCalorieGoal));
  const [nameInput, setNameInput] = useState(userName);

  const handleSave = () => {
    const goal = parseInt(goalInput, 10);
    if (!goal || goal < 500 || goal > 10000) {
      Alert.alert('Invalid Goal', 'Please enter a calorie goal between 500 and 10000.');
      return;
    }
    setDailyCalorieGoal(goal);
    setUserName(nameInput.trim() || 'User');
    router.back();
  };

  const PRESETS = [1200, 1500, 1800, 2000, 2200, 2500];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Name */}
        <View className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Your Name</Text>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your name"
            placeholderTextColor="#9ca3af"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50"
          />
        </View>

        {/* Daily Goal */}
        <View className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Daily Calorie Goal</Text>

          {/* Quick presets */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {PRESETS.map((p) => (
              <Pressable
                key={p}
                onPress={() => setGoalInput(String(p))}
                className={`px-3 py-1.5 rounded-full border ${
                  goalInput === String(p)
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    goalInput === String(p) ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder="Custom goal (kcal)"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50"
          />

          <Text className="text-xs text-gray-400 mt-2">
            Common goals: 1200 (cut), 1500–1800 (moderate deficit), 2000+ (maintenance)
          </Text>
        </View>

        {/* API Key note */}
        <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
          <Text className="text-xs font-semibold text-amber-800 mb-1">
            🔑 Gemini API Key
          </Text>
          <Text className="text-xs text-amber-700">
            AI food recognition requires a Gemini API key set as{' '}
            <Text className="font-mono font-semibold">EXPO_PUBLIC_GEMINI_API_KEY</Text> in your{' '}
            <Text className="font-mono">.env</Text> file. Get a free key at aistudio.google.com
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          className="bg-green-600 rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-base">Save Settings</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
