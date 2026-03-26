# Calorie Tracker

> Personal calorie deficit tracker with AI-powered food recognition, focused on Indian cuisine.

## Platform

iOS (React Native + Expo). Built for personal use and sharing with friends.

## Features

- Photo food recognition via Gemini Flash-Lite vision API
- Indian food calorie database focus
- Daily calorie deficit tracking
- Meal suggestions powered by AI
- No account needed — all data stored locally on device

## Tech Stack

| Layer       | Choice                       |
|-------------|------------------------------|
| Framework   | React Native + Expo SDK 52+  |
| Styling     | NativeWind v4                |
| Navigation  | Expo Router                  |
| Local DB    | Expo SQLite                  |
| Preferences | react-native-mmkv            |
| State       | Zustand                      |
| Charts      | react-native-gifted-charts   |
| AI / Vision | Google Gemini Flash-Lite     |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your iPhone, or Xcode for simulator

### Environment Setup

Create a `.env` file in the project root:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

### Run

```bash
npm install
npx expo start
```

Scan the QR code with your iPhone camera (Expo Go) or press `i` to open in iOS simulator.

## Project Structure

```
calorie_tracking_app/
├── app/                  # Expo Router screens
├── components/           # Reusable UI components
├── store/                # Zustand state stores
├── db/                   # SQLite schema and queries
├── lib/                  # Gemini API client, helpers
└── assets/               # Images, fonts
```

## Environment Variables

| Variable                     | Description              |
|------------------------------|--------------------------|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Google Gemini API key    |
