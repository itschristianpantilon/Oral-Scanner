import { View, Text, StatusBar, Image, ScrollView } from 'react-native'
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import icons from '../constants/icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const main = () => {
  const { continueAsGuest } = useAuth();

  const handleGuestAccess = () => {
    continueAsGuest();
    router.push('/home');
  };

  return (
    <SafeAreaView className='bg-white'>
      <View className="w-full h-full justify-start ">
        <View className='min-w-fit border items-center justify-start -top-10'>
          <Image 
            source={icons.ellipse}
            className="w-full"
            resizeMode='contain'
          />
        </View>
        
        <View className="w-full items-center px-4 justify-center">
          <View className='w-full flex items-center justify-center'>
            <Image
              source={icons.logo}
              className='max-w-[300px] h-[225px]'
              resizeMode='contain'
            />
          </View>

          <View className="items-center my-5 w-full"> 
            <Text className="text-2xl font-pmedium text-gray-500 mb-1">Let's Get Started</Text>
            <Text className='w-[75%] text-center font-pregular text-xs text-black/60'>Login to enjoy the feature we've provided, and stay healthy!</Text>
          </View>

          <View className="w-full justify-center items-center my-3">
            <CustomButton 
              title="Login"
              handlePress={() => router.push('/sign-in')}
              containerStyles='bg-white w-full border-[1px] border-secondary-100 mb-2 rounded-md'
              textStyles='text-secondary-100'
            />

            <CustomButton 
              title="Register"
              handlePress={() => router.push('/sign-up')}
              containerStyles='w-full rounded-md'
            />

            <CustomButton 
              title="Continue as Guest?"
              handlePress={handleGuestAccess}
              containerStyles='w-full rounded-md bg-white '
              textStyles="text-secondary-100 text-xs"
            />
          </View>
        </View>
      </View>

      <StatusBar backgroundColor='#36A2A4' style='light' />
    </SafeAreaView>
  )
}

export default main