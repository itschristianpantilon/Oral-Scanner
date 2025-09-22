import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import icons from '../constants/icons';
import CustomButton from '../components/CustomButton';

export default function App() {

    //const { isLoading, isLoggedIn } = useGlobalContext();

    //if (!isLoading && isLoggedIn) return <Redirect href='/Home' />

    return (
        <SafeAreaView className="bg-white h-full">
                    <View className='items-center justify-start -top-10'>
                      <Image 
                        source={icons.ellipse}
                        className="w-full -top-10 -right-40 absolute"
                        resizeMode='contain'
                      />
                    </View>
                <View className="w-full justify-center items-center min-h-[100vh] px-5">

                    <Image
                        source={icons.indexImage}
                        className='max-w-[350px] h-[300px]'
                        resizeMode='contain'
                    />

                    <View className='relative mt-5'>
                        <Text className='text-2xl font-bold text-center'>Harness AI for Smarter Oral Health with Our Mobile Screening <Text className='text-secondary'>System</Text></Text>

                    </View>

                    <Text className='text-sm font-pregular text-gray-500 mt-7 text-justify w-[95%]'>Where Precision Meets Prevention: Harness AI-Powered Dental Screening for Smarter, Faster Oral Health Decisions.</Text>

                    <View className="w-full my-5" >
                        <CustomButton 
                            title="Get Started"
                            handlePress={() => router.push('main')}
                        />
                    </View>
                </View>


            <StatusBar backgroundColor='#36A2A4' style='light' />
        </SafeAreaView>
    );
}

