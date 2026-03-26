import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { useStore } from '../../store/useStore';
import { getWeeklyCalories, getMealsForDate } from '../../db/queries';
import { getPastNDates, toDateString, formatDisplayDate } from '../../lib/dateUtils';

export default function HistoryScreen() {
  const { dailyCalorieGoal } = useStore();

  const pastDates = useMemo(() => getPastNDates(7), []);
  const weeklyData = useMemo(() => {
    const records = getWeeklyCalories(pastDates[0], pastDates[pastDates.length - 1]);
    const map = new Map(records.map((r) => [r.date, r.calories]));
    return pastDates.map((date) => ({
      date,
      calories: map.get(date) ?? 0,
      label: date === toDateString() ? 'Today' : new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' }),
    }));
  }, [pastDates]);

  const barData = weeklyData.map((d) => ({
    value: d.calories,
    label: d.label,
    frontColor: d.calories > dailyCalorieGoal ? '#dc2626' : '#16a34a',
    topLabelComponent: () => (
      <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 2 }}>
        {d.calories > 0 ? d.calories : ''}
      </Text>
    ),
  }));

  const dayMeals = useMemo(() => {
    return pastDates
      .slice()
      .reverse()
      .map((date) => ({
        date,
        meals: getMealsForDate(date),
        total: getMealsForDate(date).reduce((s, m) => s + m.calories, 0),
      }))
      .filter((d) => d.meals.length > 0);
  }, [pastDates]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-5 pt-4 pb-2">
          <Text className="text-lg font-bold text-gray-900">History</Text>
          <Text className="text-xs text-gray-500">Last 7 days</Text>
        </View>

        {/* Bar Chart */}
        <View className="mx-5 bg-white rounded-3xl p-4 shadow-sm">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Weekly Calories</Text>
          <BarChart
            data={barData}
            barWidth={32}
            spacing={10}
            roundedTop
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
            noOfSections={4}
            maxValue={Math.max(dailyCalorieGoal * 1.2, ...barData.map((d) => d.value))}
            referenceLine1Position={dailyCalorieGoal}
            referenceLine1Config={{ color: '#d1fae5', dashWidth: 4, dashGap: 4, thickness: 1 }}
          />
          <View className="flex-row items-center mt-2 gap-4">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-sm bg-green-600" />
              <Text className="text-xs text-gray-500">Under goal</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-sm bg-red-600" />
              <Text className="text-xs text-gray-500">Over goal</Text>
            </View>
          </View>
        </View>

        {/* Daily Logs */}
        <View className="mx-5 mt-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Daily Logs</Text>
          {dayMeals.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
              <Text className="text-gray-400 text-sm">No meal history yet</Text>
            </View>
          ) : (
            dayMeals.map(({ date, meals, total }) => (
              <View key={date} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatDisplayDate(date)}
                  </Text>
                  <Text className={`text-sm font-bold ${total > dailyCalorieGoal ? 'text-red-600' : 'text-green-600'}`}>
                    {total} kcal
                  </Text>
                </View>
                {meals.map((meal) => (
                  <View key={meal.id} className="flex-row justify-between py-1 border-t border-gray-50">
                    <Text className="text-xs text-gray-600 flex-1" numberOfLines={1}>{meal.name}</Text>
                    <Text className="text-xs text-gray-500 ml-2">{meal.calories} kcal</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
