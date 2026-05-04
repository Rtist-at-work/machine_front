// app/_layout.js
import { useState } from "react";
import { AppProvider } from "@/context/AppContext";
import { Stack } from "expo-router";
import "../global.css";
import { LocationProvider } from "@/context/LocationContext";
import { FileUploadProvider } from "@/context/FileUpload";
import { FormatTimeProvider } from "@/context/FormatTime";
import { linking } from "./linking";

import SplashScreen from "@/components/SplashScreen";

// ✅ NEW IMPORT
import AppToast from "@/components/Toast";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);


  // Splash stays unchanged
  if (showSplash) {
    return <SplashScreen onAnimationComplete={() => setShowSplash(false)} />;
  }

  return (
    // ✅ Wrap EVERYTHING
    <>
      <AppToast/>

      <LocationProvider>
        <FileUploadProvider>
          <FormatTimeProvider>
            <AppProvider>
              <Stack linking={linking}>
                <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="E2" options={{ headerShown: false }} />
                <Stack.Screen name="Login" options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" options={{ headerShown: false }} />
                <Stack.Screen
                  name="ServicePage"
                  options={{ headerShown: false }}
                />
              </Stack>
            </AppProvider>
          </FormatTimeProvider>
        </FileUploadProvider>
      </LocationProvider>
    </>
  );
}