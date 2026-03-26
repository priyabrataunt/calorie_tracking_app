import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '../db/schema';
import { useStore } from '../store/useStore';

export default function RootLayout() {
  const { loadSettings, refreshMeals } = useStore();

  useEffect(() => {
    initDb().then(() => {
      loadSettings();
      refreshMeals();
    });
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="log-meal"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Log Meal',
            headerStyle: { backgroundColor: '#f9fafb' },
            headerTintColor: '#16a34a',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: '#f9fafb' },
            headerTintColor: '#16a34a',
          }}
        />
      </Stack>
    </>
  );
}
