// App.tsx
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { initDatabase } from "./src/services/LocalDatabase";
import { AuthProvider } from "./src/context/AuthContext";
import "./src/i18n";

import { HomeScreen } from "./src/screens/HomeScreen";
import { CategoryDetailScreen } from "./src/screens/CategoryDetailScreen";
import { VideoPlayerScreen } from "./src/screens/VideoPlayerScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import type { AppStackParamList } from "./src/types";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Surdo.Media" }}
      />
      <Stack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={({ route }) => ({ title: route.params?.title || "Категория" })}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Избранное" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "История" }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Вход" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Регистрация" }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn("DB Init Error:", e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  };

  if (!isReady) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
