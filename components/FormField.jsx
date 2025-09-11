import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {

    const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className='text-sm text-gray-500 font-pregular'>{title}</Text>

      <View className='bg-zinc-50 w-full min-h-[10px] px-2 bg-gray rounded-md border-[1px] border-gray-300 focus:border-secondary items-center flex-row'>
        <TextInput 
            className='flex-1 font-psemibold text-base w-full'
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#bdbdbd"
            onChangeText={handleChangeText}
            secureTextEntry={title === 'Password' && !showPassword}
        />
        {title === "Password" && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image 
                   // source={!showPassword ? icons.eyeHide: icons.eye}
                    className='w-6 h-7'
                    resizeMode='contain'
                />
            </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField