import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

let splashPrevented = false;

async function ensureSplashHidden(): Promise<void> {
  if (!splashPrevented) {
    splashPrevented = true;
    await SplashScreen.preventAutoHideAsync();
  }
}

export default function RootLayout(): JSX.Element | null {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token, isCheckingAuth } = useAuthStore();

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  useEffect(() => {
    ensureSplashHidden();
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const canHideSplash = fontsLoaded && !isCheckingAuth;

    if (canHideSplash && !isAppReady) {
      setIsAppReady(true);
      SplashScreen.hideAsync().catch((error) =>
        console.warn("Failed to hide splash screen:", error)
      );
    }
  }, [fontsLoaded, isCheckingAuth, isAppReady]);

  // handle navigation based on the auth state
  useEffect(() => {
    if (!isAppReady) return;

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = Boolean(user && token);

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [user, token, segments, isAppReady]);

  if (!isAppReady) return null;

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
