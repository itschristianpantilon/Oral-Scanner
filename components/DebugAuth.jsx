import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DebugAuth = () => {
  const { user, isGuest, loading, initializing, continueAsGuest, signOut } = useAuth();

  const checkAsyncStorage = async () => {
    try {
      const guestSession = await AsyncStorage.getItem('guestSession');
      const guestHistory = await AsyncStorage.getItem('guestHistory');
      
      Alert.alert('AsyncStorage Debug', 
        `Guest Session: ${guestSession}\nGuest History: ${guestHistory ? 'Exists' : 'None'}`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.removeItem('guestSession');
      await AsyncStorage.removeItem('guestHistory');
      Alert.alert('Success', 'AsyncStorage cleared');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Debug Auth State
      </Text>
      
      <View style={{ marginBottom: 20 }}>
        <Text>User: {user ? `${user.email} (${user.displayName})` : 'None'}</Text>
        <Text>Guest: {isGuest ? 'Yes' : 'No'}</Text>
        <Text>Loading: {loading ? 'Yes' : 'No'}</Text>
        <Text>Initializing: {initializing ? 'Yes' : 'No'}</Text>
        <Text>Logged In: {user || isGuest ? 'Yes' : 'No'}</Text>
      </View>

      <TouchableOpacity 
        style={{ backgroundColor: '#007AFF', padding: 15, marginBottom: 10, borderRadius: 8 }}
        onPress={continueAsGuest}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Continue as Guest</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: '#34C759', padding: 15, marginBottom: 10, borderRadius: 8 }}
        onPress={checkAsyncStorage}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Check AsyncStorage</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: '#FF3B30', padding: 15, marginBottom: 10, borderRadius: 8 }}
        onPress={clearAsyncStorage}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Clear AsyncStorage</Text>
      </TouchableOpacity>

      {(user || isGuest) && (
        <TouchableOpacity 
          style={{ backgroundColor: '#FF9500', padding: 15, marginBottom: 10, borderRadius: 8 }}
          onPress={signOut}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DebugAuth;