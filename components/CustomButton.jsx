import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
   <TouchableOpacity 
    className={`bg-secondary rounded-3xl min-h-[50px] items-center justify-center ${containerStyles} ${isLoading ? 'opacity-50': ''} hover:opacity-50`}
    disabled={isLoading}
    onPress={handlePress}
    activeOpacity={0.7}
    >
      <Text className={`text-white font-psemibold text-md ${textStyles}`}>{title}</Text>
      
    </TouchableOpacity>
  )
}

export default CustomButton