import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { Camera, CameraView, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { ActivityIndicator } from 'react-native';
import icons from '../../constants/icons';


const Home = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef(null);
  const [captureUploadBTN, setCaptureUploadBTN] = useState(true);
  const [captureUploadNew, setCaptureUploadNew] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [gradcamUri, setGradcamUri] = useState(null); // if you return a Grad-CAM image
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [healthTips, setHealthTips] = useState('');
  const [confidence, setConfidence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flash, setFlash] = useState('off');
  const [cameraType, setCameraType] = useState('back');

const toggleFlash = () => {
  const newFlash = flash === 'off' ? 'torch' : 'off';
  console.log('Toggling flash to:', newFlash);
  setFlash(newFlash);
};

const switchCamera = () => {
  const newType = cameraType === 'back' ? 'front' : 'back';
  console.log('Switching camera to:', newType);
  setCameraType(newType);
};

useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
  })();
}, []);


  const predictImage = async (uri) => {
  setIsLoading(true);
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'image.jpg',
    type: 'image/jpeg',
  });

  try {
    const response = await fetch('http://192.168.18.5:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('🔍 API Result:', result);

    const classMap = {
        0: 'Calculus',
        1: 'Caries',
        2: 'Gingivitis',
        3: 'Hypodontia',
        4: 'Tooth Discoloration',
        5: 'Ulcers'
      };

    const treatmentMap = {
      Calculus: {
        treatment: 'Professional dental cleaning to remove plaque and tartar using ultrasonic instruments or hand scalers. Left untreated, it can lead to gum disease. Cleaning is usually done by a dental hygienist or dentist.',
        recommendation: 'Brush twice daily with fluoride toothpaste and floss once a day. Regular dental cleanings every 6 months are essential to prevent calculus buildup.',
        source: 'American Dental Association (ADA), Mayo Clinic'
      },
      Caries: {
        treatment: 'Cavities are treated by removing decayed material and filling the area. Severe decay may require a root canal or crown. Early detection allows for less invasive procedures.',
        recommendation: 'Limit sugary snacks and drinks. Brush with fluoride toothpaste, floss daily, and get regular check-ups to catch early signs.',
        source: 'World Health Organization (WHO), ADA'
      },
      Gingivitis: {
        treatment: 'Mild gum inflammation can be reversed with professional cleaning and better oral hygiene. Severe cases might need scaling and root planing.',
        recommendation: 'Use antiseptic mouthwash and floss daily to remove plaque between teeth. Avoid tobacco use.',
        source: 'Centers for Disease Control and Prevention (CDC), NHS UK'
      },
      Hypodontia: {
        treatment: 'Treatment depends on the number and position of missing teeth. It may include orthodontics, partial dentures, or dental implants.',
        recommendation: 'Children with missing teeth should be monitored regularly. A dental specialist can develop a long-term plan including aesthetic and functional solutions.',
        source: 'American Association of Orthodontists (AAO), Cleveland Clinic'
      },
      'Tooth Discoloration': {
        treatment: 'Whitening treatments include in-office bleaching, at-home trays, or veneers for intrinsic stains. Professional assessment is required to identify the cause.',
        recommendation: 'Reduce intake of coffee, tea, and red wine. Avoid tobacco, and rinse your mouth after eating stain-causing foods.',
        source: 'Mayo Clinic, ADA'
      },
      Ulcers: {
        treatment: 'Minor ulcers usually heal on their own, but topical corticosteroids, antimicrobial mouth rinses, or anesthetic gels can speed healing and reduce pain.',
        recommendation: 'Avoid spicy or acidic foods. Stay hydrated and maintain oral hygiene. If ulcers persist for more than 2 weeks, consult a dentist.',
        source: 'WebMD, NHS UK'
      }
    };


    const diseaseName = classMap[result.class];
    setPrediction(`Disease: ${classMap[result.class]}`);
    setConfidence(`${(result.confidence * 100).toFixed(1)}%`)

    console.log('✅ Set prediction to:', result.prediction);

    if (treatmentMap[diseaseName]) {
      setTreatmentPlan(treatmentMap[diseaseName].treatment);
      setHealthTips(treatmentMap[diseaseName].recommendation);
    } else {
      setTreatmentPlan('No treatment plan available.');
      setHealthTips('No recommendations available.');
    }

    if (result.gradcam) {
      setGradcamUri(`data:image/jpeg;base64,${result.gradcam}`);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }finally {
    setIsLoading(false); // End loading
  }
};




  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

const CaptureUploadNew = () => {
  setImageUri(null);
  setCaptureUploadBTN(true);
  setCaptureUploadNew(false);
  setPrediction('');
  setTreatmentPlan('');
  setHealthTips('');
  setGradcamUri(null);
};


useEffect(() => {
  if (imageUri) {
    setCaptureUploadNew(true);
    setCaptureUploadBTN(false);
    predictImage(imageUri); // <- this line triggers prediction
  }
}, [imageUri]);



const takePicture = async () => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync();
    setImageUri(photo.uri); // prediction will be triggered by useEffect
    setIsCameraActive(false);
  }
};


const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Correct usage
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    setImageUri(result.assets[0].uri);
  }
};

// const toggleFlash = () => {
//   setFlash(
//     flash === FlashMode.off ? FlashMode.torch : FlashMode.off
//   );
// };

// const switchCamera = () => {
//   setCameraType(
//     cameraType === CameraType.back ? CameraType.front : CameraType.back
//   );
// };






  if (hasCameraPermission === null) return <Text>Requesting permission...</Text>;
  if (hasCameraPermission === false) return <Text>No access to camera</Text>;

  return (
    <SafeAreaView className="bg-white items-center h-[100vh] w-full">

      
      <View className="bg-white w-full min-h-[50px] mt-1 flex-row items-center justify-between relative">
      
            <TouchableOpacity className="px-3">
              <Image 
                source={icons.back}
                className="w-8 h-8"
                resizeMode='contain'
              />
            </TouchableOpacity>
              <View className="flex-row justify-center items-center absolute w-full h-full">
                <Image 
                  source={icons.logoOnly}
                  className="w-10 h-10"
                  resizeMode='contain'
                />
                <Image 
                  source={icons.textOnly}
                  className="w-20 h-10"
                  resizeMode='contain'
                />
              </View>
      </View>

      <View className='w-full items-center justify-center'>
        {isCameraActive ? (
          <View className='w-[90%] h-full rounded-xl items-center justify-evenly'>
            <View className='items-center justify-center'>
              <View className="border-[2px] rounded-xl border-secondary p-3">
                <CameraView
                  className="w-72 h-72 rounded-xl"
                  type={cameraType}
                  flash={flash}
                  ref={cameraRef}
                >
                </CameraView>
              </View>

              <Text className="text-justify text-sm font-plight text-gray-700 px-4 my-7 w-auto">Ensure the image is focused, close to the mouth, and not blurry. Keep the camera about 5–10 cm from the teeth.
              </Text>
            </View>
              <View className="flex-row w-full items-start justify-evenly h-36">
                <TouchableOpacity onPress={toggleFlash} className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-12 h-12 p-3">
                  <Image 
                    source={icons.flashlight}
                    className="w-full h-full"
                    resizeMode='contain'
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={takePicture} className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-16 h-16 p-3">
                  <Image 
                    source={icons.capture}
                    className="w-full h-full"
                    resizeMode='contain'
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={switchCamera} className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-12 h-12 p-3">
                  <Image 
                    source={icons.rotateIcon}
                    className="w-full h-full"
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              </View>
            

          </View>
        ) : (
          <View className="justify-start items-start w-full h-full">
            {imageUri && (
              <>
            <Text className="w-full text-base font-psemibold text-secondary px-4 py-3 text-center">Classification Result</Text>
              <View className="relative items-center justify-center w-full">
                <Image source={{ uri: imageUri }} className="w-72 h-72 rounded-xl" resizeMode="cover" />
                  {isLoading && (
                    <View className="items-center justify-center border-[1px] rounded-xl bg-black-100/70 w-72 h-72 absolute">
                      <ActivityIndicator size="large" color="#FFF" />
                      <Text className="text-white mt-2 text-sm font-pmedium">Analyzing Image</Text>
                    </View>
             
              )}

                </View>
          </>
            )}
            {captureUploadBTN && (
              <View className="items-center justify-center h-full">

                <View className="w-44 h-44 p-1 mb-5">
                  <Image 
                    source={icons.imageOutline}
                    className="w-full h-full"
                    resizeMode='contain'
                  />
                </View>

                <Text className="text-center text-base font-plight text-gray-700 px-6 mb-4">
                  Please upload or capture a clear image of your oral cavity to begin analysis.
                  Make sure the area is well-lit and focused for accurate predictions.
                </Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity onPress={() => setIsCameraActive(true)} className="bg-white border-[1px] border-secondary-100 px-6 py-3 rounded-lg">
                    <Text className="text-secondary font-semibold text-base">Use Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={pickImage} className="bg-secondary px-6 py-3 rounded-lg">
                    <Text className="text-white font-semibold text-base">Upload Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
                  {prediction !== '' && (
                    <View className="items-center mt-5 w-full">
                      <Text className="text-lg font-semibold text-secondary">Prediction: {prediction}</Text>
                      <Text className="text-lg font-semibold text-secondary">Confidence Level: {confidence}</Text>
                      {gradcamUri && (
                        <Image source={{ uri: gradcamUri }} className="w-64 h-64 rounded-xl" />
                      )}
                    </View>
                  )}
                    <View className="p-4 w-full h-56 items-center justify-center ">
                          {treatmentPlan !== '' && (
                            <>
                              <ScrollView className="bg-gray-100/40 rounded-xl p-4 h-full w-full overflow-scroll">
                                <Text className="text-base font-semibold text-secondary mb-1">Treatment Plan:</Text>
                                <Text className="text-sm text-gray-700">{treatmentPlan}</Text>
                                <Text className="text-base font-semibold text-secondary mb-1">Recommendations:</Text>
                                <Text className="text-sm text-gray-700">{healthTips}</Text>
                              </ScrollView>
                            
                            </>

                            )}
                            {isLoading && (
                                <View className="items-center justify-center mt-4 rounded-md p-4 absolute">
                                  <ActivityIndicator size="large" color="#6B7280" />
                                  <Text className="text-secondary mt-2 text-sm">Providing Treatment & Tips.</Text>
                                </View>
                            )}
                      </View>


            


            {captureUploadNew && (
              <View className="flex-row gap-4 w-full justify-end">
                <TouchableOpacity onPress={CaptureUploadNew} className="bg-white border-[1px] border-secondary-100 p-3 rounded-full">
                  <Image 
                    source={icons.camera}
                    className="w-9 h-9"
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              </View>
            )}



          </View>
          )}
      </View>
      <StatusBar backgroundColor='#36A2A4' style='dark' />
    </SafeAreaView>
  );
};

export default Home;
