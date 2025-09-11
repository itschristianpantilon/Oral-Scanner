import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

// Protected routes component
const ProtectedRoute = ({ children }) => {
  const { user, loading, isGuest, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (loading || initializing) return; // Wait for auth to initialize

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isAuthenticated = user || isGuest;
    const isOnIndex = segments.length === 0 || segments[0] === 'index';
    const isOnGetStarted = segments[0] === 'getStarted';
    const isOnMain = segments[0] === 'main';

    console.log('ProtectedRoute:', {
      segments: segments.join('/'),
      isAuthenticated,
      inAuthGroup,
      inTabsGroup,
      isOnIndex,
      isOnGetStarted
    });

    // Don't redirect if navigation is not ready or if already navigating
    if (!isNavigationReady && !isOnIndex) {
      setIsNavigationReady(true);
      return;
    }

    // Allow manual navigation to auth pages even when authenticated (guest can sign in/up)
    if (inAuthGroup && isAuthenticated) {
      console.log('Allowing navigation to auth pages');
      return;
    }

    // Redirect unauthenticated users away from protected routes
    if (!isAuthenticated && inTabsGroup) {
      console.log('Redirecting unauthenticated user to sign-in');
      router.replace('/(auth)/sign-in');
      return;
    }

    // Don't interfere with other navigation
    setIsNavigationReady(true);
  }, [user, loading, isGuest, initializing, segments.join('/'), isNavigationReady]);

  return children;
};

const RootLayoutNav = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <ProtectedRoute>
      <Stack>
        <Stack.Screen name='getStarted' options={{ headerShown: false }} />
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='main' options={{ headerShown: false }} />   
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />   
      </Stack>
    </ProtectedRoute>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
};

export default RootLayout;