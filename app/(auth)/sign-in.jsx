import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import Header from '../../components/Header';
import icons from '../../constants/icons';
import { useAuth } from '../../context/AuthContext';
import DebugAuth from '../../components/DebugAuth';

const signin = () => {
  const { signInWithEmail, signInWithGoogle, loading, isGoogleSigninAvailable } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await signInWithEmail(form.email, form.password);
    setIsLoading(false);

    if (result.success) {
      router.replace('/home');
    } else {
      Alert.alert('Sign In Failed', result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isGoogleSigninAvailable) {
      Alert.alert('Google Sign-In Unavailable', 'Google Sign-In is not available at the moment. Please use email/password to sign in.');
      return;
    }

    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);

    if (result.success) {
      router.replace('/home');
    } else {
      Alert.alert('Google Sign In Failed', result.error);
    }
  };

  return (
    <SafeAreaView className='bg-white h-full'>
      <Header title="Login" />
      <ScrollView className="">
        <View className='w-full min-h-[75vh] px-4 justify-center'>
          <FormField 
            title='Email'
            value={form.email}
            handleChangeText={(e) => setForm({...form, email: e})}
            otherStyles="mt-2"
            keyboardType="email-address"
          />

          <FormField 
            title='Password'
            value={form.password}
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles="mt-7"
          />  

          <View className="py-2">
            <Text className='text-sm text-semibold font-psemibold text-secondary w-full text-right'>Forgot Password?</Text>
          </View>

          <CustomButton 
            title="Sign In"
            handlePress={handleEmailSignIn}
            containerStyles="mt-3"
            isLoading={isLoading || loading}
            textStyles="text-white"
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-sm font-pregular'>Don't have an account?</Text>
            <Link href='/sign-up' className='text-sm font-psemibold text-secondary'>Sign Up</Link>
          </View>

          {/* Only show Google Sign-In if available */}
          {isGoogleSigninAvailable && (
            <View className="mt-3 w-full">
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500 font-pregular">OR</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <TouchableOpacity 
                className={`bg-white border-[1px] border-gray-400 rounded-3xl min-h-[50px] flex-row items-center justify-between hover:opacity-50 w-full relative py-2 ${(isLoading || loading) ? 'opacity-50' : ''}`}
                onPress={handleGoogleSignIn}
                activeOpacity={0.7}
                disabled={isLoading || loading}
              >       
                <View className="px-6">
                  <Image 
                    source={icons.google}
                    className="w-8 h-8"
                    resizeMode='contain'
                  />
                </View>
                <Text className={`text-gray-500 font-psemibold text-md w-full absolute text-center`}>
                  {(isLoading || loading) ? 'Signing in...' : 'Sign In with Google'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        
      </ScrollView>
    </SafeAreaView>
  )
}

export default signin;