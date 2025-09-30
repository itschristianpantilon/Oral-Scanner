import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import icons from '../constants/icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';



const main = () => {


  return (
    <SafeAreaView className='bg-white flex-1'>
      <View className="w-full h-full justify-start ">
        <View className='items-center justify-start -top-10'>
          <Image 
            source={icons.ellipse}
            className="w-full -top-10 -left-40 absolute"
            resizeMode='contain'
          />
        </View>
        
        <View className="flex-1 items-center px-4 justify-between">

          <View className="flex-1 items-center justify-center pt-32">
            <View className='w-full flex items-center justify-center'>
              <Image
                source={icons.logo2}
                className='max-w-[250px] h-[200px]'
                resizeMode='contain'
              />
            </View>

            <View className="items-center my-5 w-full"> 
              <Text className="text-2xl font-pmedium text-gray-500 mb-1">Let's Get Started</Text>
              <Text className='text-center mt-2 font-plight text-xs text-black/60'>Scan your teeth with your smartphone camera and let our AI analyze for up to 6 common dental diseases. Get instant, personalized insights and guidance, all from the comfort of your home. Start your journey to a healthier smile today.</Text>
            </View>
          </View>

          <View className="w-full flex-row justify-between items-center my-12">

            <TouchableOpacity 
              className="py-1 px-3 rounded-full bg-gray-100/20"
              onPress={()=> router.back()}
            >
              <Image 
                source={icons.back}
                className="w-9 h-9"
                resizeMode='contain'
                />
            </TouchableOpacity>

            <CustomButton 
              title="Continue"
              handlePress={() => router.push('/home')}
              containerStyles='w-32 rounded-full'
            />
          </View>

        </View>
      </View>

      <StatusBar backgroundColor='#36A2A4' style='light' />
    </SafeAreaView>
  )
}

export default main