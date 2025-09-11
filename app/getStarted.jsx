import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const Index = () => {
  const { user, isGuest, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only handle initial app launch, not subsequent navigation
    if (initializing) return;

    const timer = setTimeout(() => {
      if (user || isGuest) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/getStarted');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [initializing]); // Only depend on initializing, not user state

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#fff' 
    }}>
      <ActivityIndicator size="large" color="#0066cc" />
      <Redirect href='/' />
    </View>
  );
};

export default Index;