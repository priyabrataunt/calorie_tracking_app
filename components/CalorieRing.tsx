import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface Props {
  consumed: number;
  goal: number;
}

export default function CalorieRing({ consumed, goal }: Props) {
  const remaining = Math.max(0, goal - consumed);
  const over = Math.max(0, consumed - goal);
  const percent = Math.min(100, Math.round((consumed / goal) * 100));
  const isOver = consumed > goal;

  const pieData = isOver
    ? [{ value: 1, color: '#dc2626' }]
    : [
        { value: consumed, color: '#16a34a' },
        { value: remaining, color: '#e5e7eb' },
      ];

  return (
    <View className="items-center">
      <PieChart
        data={pieData}
        donut
        radius={80}
        innerRadius={58}
        centerLabelComponent={() => (
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">{consumed}</Text>
            <Text className="text-xs text-gray-500">kcal</Text>
            <Text className={`text-xs font-medium ${isOver ? 'text-red-600' : 'text-green-600'}`}>
              {isOver ? `+${over} over` : `${percent}%`}
            </Text>
          </View>
        )}
      />
      <View className="flex-row mt-3 gap-6">
        <View className="items-center">
          <Text className="text-sm font-semibold text-gray-900">{goal}</Text>
          <Text className="text-xs text-gray-500">Goal</Text>
        </View>
        <View className="items-center">
          <Text className="text-sm font-semibold text-gray-900">{consumed}</Text>
          <Text className="text-xs text-gray-500">Eaten</Text>
        </View>
        <View className="items-center">
          <Text className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
            {isOver ? `-${over}` : `${remaining}`}
          </Text>
          <Text className="text-xs text-gray-500">{isOver ? 'Over' : 'Left'}</Text>
        </View>
      </View>
    </View>
  );
}
