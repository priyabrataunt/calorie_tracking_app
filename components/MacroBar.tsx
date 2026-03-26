import React from 'react';
import { View, Text } from 'react-native';

interface MacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
}

function MacroItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="items-center flex-1">
      <View className="w-full h-1.5 rounded-full bg-gray-200 mb-1 overflow-hidden">
        <View className="h-full rounded-full" style={{ backgroundColor: color, width: `${Math.min(100, (value / 60) * 100)}%` }} />
      </View>
      <Text className="text-sm font-semibold text-gray-900">{Math.round(value)}g</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}

export default function MacroBar({ protein, carbs, fat }: MacroBarProps) {
  return (
    <View className="flex-row gap-4 px-4 py-3 bg-white rounded-2xl shadow-sm">
      <MacroItem label="Protein" value={protein} color="#3b82f6" />
      <MacroItem label="Carbs" value={carbs} color="#f59e0b" />
      <MacroItem label="Fat" value={fat} color="#ec4899" />
    </View>
  );
}
