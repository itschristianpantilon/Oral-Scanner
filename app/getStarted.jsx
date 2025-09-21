import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';


const Index = () => {

  return (
    <View >
      <Redirect href='App' />
    </View>
  );
};

export default Index;