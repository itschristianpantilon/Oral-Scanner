import { View, Text, Image } from 'react-native'
import React from 'react'
import icons from '../constants/icons'
import { Link, router } from 'expo-router'
import CustomButton from './CustomButton'

const NotLoggedInProfile = () => {
  return (
    <View className="w-[90%] h-[80%] items-center justify-center">
      <View className="justify-center items-center">
        <Image 
          source={icons.userx}
          className="w-20 h-16"
          resizeMode='contain'
        />
        <Text className="font-pmedium my-2 text-base text-center">
          Please sign in to access your profile and save your detection history
        </Text>
      </View>

      <View className="w-full items-center justify-center mt-6">
        <CustomButton 
          title="Sign In"
          handlePress={() => router.push('/(auth)/sign-in')}
          containerStyles="mt-3 w-[90%]"
          isLoading={false}
          textStyles="text-white"
        />
        
        <CustomButton 
          title="Sign Up"
          handlePress={() => router.push('/(auth)/sign-up')}
          containerStyles="mt-3 w-[90%] bg-secondary"
          isLoading={false}
          textStyles="text-white"
        />
      </View>

      <View className='justify-center items-center pt-5 flex-row gap-2'>
        <Text className='text-xs font-pregular'>Or</Text>
        <Link href='/(tabs)/home' className='text-sm font-psemibold text-secondary'>
          Continue as Guest
        </Link>
      </View>
    </View>
  )
}

export default NotLoggedInProfile