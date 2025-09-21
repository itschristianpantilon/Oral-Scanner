import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import icons from '../constants/icons';
import { router } from 'expo-router';


const Header = ({ title, onPress }) => {
  return (
    <View className="bg-white w-full min-h-[50px] flex-row items-center justify-between py-2 relative">

      <TouchableOpacity onPress={()=> router.back()} className="px-3">
        <Image 
          source={icons.back}
          className="w-8 h-8"
          resizeMode='contain'
        />
      </TouchableOpacity>
        <Text className='text-xl text-semibold font-psemibold text-secondary absolute text-center w-full'>{title}</Text>
    </View>
  )
}

export default Header