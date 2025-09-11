import { Image, StatusBar, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotLoggedInProfile from '../../components/NotLoggedInProfile';
import icons from '../../constants/icons';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

const profile = () => {
  const { user, isGuest, signOut, getHistory, isLoggedIn } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const userHistory = await getHistory();
      setHistory(userHistory.reverse()); // Show most recent first
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const renderHistoryItem = (item, index) => (
    <View key={index} className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-psemibold text-lg text-gray-800">{item.disease}</Text>
        <Text className="text-xs text-gray-500">{item.date}</Text>
      </View>
      <Text className="text-sm text-gray-600 mb-2">
        Confidence: {(item.confidence * 100).toFixed(1)}%
      </Text>
      {item.image && (
        <Image 
          source={{ uri: item.image }}
          className="w-full h-32 rounded-lg"
          resizeMode="cover"
        />
      )}
    </View>
  );

  return (
    <SafeAreaView className="h-full w-full px-4 bg-white">
      {isLoggedIn ? (
        <ScrollView className="w-full h-full" showsVerticalScrollIndicator={false}>
          <View className="items-center justify-center h-16">
            <Text className="font-psemibold text-lg">Profile</Text>
          </View>

          {/* Profile Section */}
          <View className="w-full h-56 flex items-center justify-center">
            <View className="w-24 h-24 rounded-full mb-5">
              <Image 
                source={
                  user?.photoURL 
                    ? { uri: user.photoURL }
                    : isGuest 
                      ? icons.profile 
                      : icons.profile
                }
                className="w-full h-full rounded-full"
                resizeMode='cover'
              />
            </View>
            <View className="items-center justify-center">
              <Text className="font-pbold text-2xl">
                {isGuest 
                  ? 'Guest User' 
                  : user?.displayName || 'User'
                }
              </Text>
              {!isGuest && (
                <Text className="font-pregular text-sm text-gray-600">
                  {user?.email || 'No email'}
                </Text>
              )}
            </View>
          </View>

          {/* History Section */}
          <View className="flex-1 mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-psemibold text-xl">Detection History</Text>
              {user && (
                <TouchableOpacity onPress={fetchHistory}>
                  <Text className="text-secondary font-pmedium">Refresh</Text>
                </TouchableOpacity>
              )}
            </View>

            {isGuest ? (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <Text className="text-yellow-800 font-pmedium text-center">
                  Sign up or log in to save your detection history!
                </Text>
              </View>
            ) : loading ? (
              <View className="items-center justify-center py-8">
                <Text className="text-gray-500">Loading history...</Text>
              </View>
            ) : history.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text className="text-gray-500 font-pregular">No detections yet</Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Start using the camera feature to detect plant diseases
                </Text>
              </View>
            ) : (
              <View className="pb-20">
                {history.map((item, index) => renderHistoryItem(item, index))}
              </View>
            )}
          </View>

          {/* Sign Out Button */}
          {!isGuest && (
            <View className="pb-8 pt-4">
              <TouchableOpacity
                onPress={handleSignOut}
                className="bg-red-500 rounded-lg py-3 px-6 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-psemibold">Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="h-full w-full px-4 items-center justify-center">
          <NotLoggedInProfile />
        </View>
      )}

      
      <StatusBar backgroundColor='#36A2A4' style='dark' />
    </SafeAreaView>
  )
}

export default profile