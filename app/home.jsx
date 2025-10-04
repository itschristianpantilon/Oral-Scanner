import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import Header from "../components/Header";
import icons from "../constants/icons";

const Home = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef(null);

  const [captureUploadBTN, setCaptureUploadBTN] = useState(true);
  const [captureUploadNew, setCaptureUploadNew] = useState(false);

  const [prediction, setPrediction] = useState("");
  const [overlayUri, setOverlayUri] = useState(null); // ✅ combined overlay
  const [classMasks, setClassMasks] = useState([]); // ✅ per-class overlays
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [healthTips, setHealthTips] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [flash, setFlash] = useState("off");
  const [cameraType, setCameraType] = useState("back");

  const [prevention, setPrevention] = useState("");

  const [detections, setDetections] = useState([]); 


  const toggleFlash = () => {
    if (cameraType === "front") {
      console.log("⚡ Flash not available on front camera");
      return;
    }
    setFlash(flash === "off" ? "on" : "off");
  };

  const switchCamera = () => {
    const newType = cameraType === "back" ? "front" : "back";
    setCameraType(newType);
    if (newType === "front") setFlash("off");
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, []);

const predictImage = async (uri) => {
  setIsLoading(true);
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "image.jpg",
    type: "image/jpeg",
  });

  try {
    const response = await fetch("http://192.168.18.5:5000/predict", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    // console.log("🔍 API Result:", result);


    if (result.detections && result.detections.length > 0) {
      const diseases = result.detections.map((d) => d.class);
      setPrediction(`Detected classes: ${diseases.join(", ")}`);

      if (result.result_image_base64) {
        setOverlayUri(`data:image/png;base64,${result.result_image_base64}`);
      }

      // ✅ New: treatment + recommendations + prevention
      //if (result.treatment_plan) setTreatmentPlan(result.treatment_plan);
      // if (result.health_tips) setHealthTips(result.recommendation);
      // if (result.prevention) setPrevention(result.prevention);

      setDetections(result.detections);

    } else {
      setPrediction("No disease detected.");
      setOverlayUri(null);
      setTreatmentPlan("");
      setHealthTips("");
    }
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    setPrediction("Error processing image.");
  } finally {
    setIsLoading(false);
  }
};



  const CaptureUploadNew = () => {
    setImageUri(null);
    setCaptureUploadBTN(true);
    setCaptureUploadNew(false);
    setPrediction("");
    setTreatmentPlan("");
    setHealthTips("");
    setOverlayUri(null);
    setClassMasks([]);
  };

  useEffect(() => {
    if (imageUri) {
      setCaptureUploadNew(true);
      setCaptureUploadBTN(false);
      predictImage(imageUri);
    }
  }, [imageUri]);

const takePicture = async () => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.5, // compress to 50%
      base64: false, // don’t keep base64 in memory
    });
    setImageUri(photo.uri);
    setIsCameraActive(false);
  }
};


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  if (hasCameraPermission === null) return <Text>Requesting permission...</Text>;
  if (hasCameraPermission === false) return <Text>No access to camera</Text>;

  return (
    <SafeAreaView className="bg-white items-center h-full w-full">
      {/* Header */}
      <View className="bg-white w-full min-h-[50px] mt-1 flex-row items-center justify-between relative">
        <TouchableOpacity className="px-3" onPress={() => router.back()}>
          <Image source={icons.back} className="w-8 h-8" resizeMode="contain" />
        </TouchableOpacity>
        <View className="flex-row justify-center items-center absolute w-full h-full">
          <Image source={icons.logoOnly} className="w-10 h-10" resizeMode="contain" />
          <Text className="text-secondary-100 font-psemibold text-md ml-1 mt-1">Scanner</Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="w-full flex-1 items-center justify-center">
        {isCameraActive ? (
          // 📸 Camera View
          <View className="w-[90%] flex-1 rounded-xl items-center justify-evenly">
            <View className="items-center justify-center">
              <View className="">
                <CameraView
                  className="w-80 h-80 rounded-md"
                  facing={cameraType}
                  flash={flash}
                  ref={cameraRef}
                />
              </View>
              <Text className="text-center text-sm font-plight text-gray-700 px-4 my-7">
                Ensure the image is focused, close to the mouth, and not blurry. Keep the
                camera about 5–10 cm from the teeth.
              </Text>
            </View>
            {/* Controls */}
            <View className="flex-row w-full items-start justify-evenly h-36">
              {/* Flash */}
              <TouchableOpacity
                onPress={toggleFlash}
                className={`border-[2px] border-secondary justify-center items-center rounded-full w-12 h-12 p-3 ${
                  flash === "on" ? "bg-secondary-100" : "bg-white"
                }`}
                disabled={cameraType === "front"}
              >
                <Image
                  source={flash === "on" ? icons.flashlightWhite : icons.flashlight}
                  className="w-full h-full"
                  resizeMode="contain"
                  style={{ opacity: cameraType === "front" ? 0.5 : 1 }}
                />
              </TouchableOpacity>

              {/* Capture */}
              <TouchableOpacity
                onPress={takePicture}
                className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-16 h-16 p-3"
              >
                <Image source={icons.capture} className="w-full h-full" resizeMode="contain" />
              </TouchableOpacity>

              {/* Switch Camera */}
              <TouchableOpacity
                onPress={switchCamera}
                className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-12 h-12 p-3"
              >
                <Image source={icons.rotateIcon} className="w-full h-full" resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // 📊 Results & Upload
          <ScrollView className="w-full px-4" contentContainerStyle={{ alignItems: "center" }}>



            {/* Original Image */}
            <View className="">
              <View>
                {imageUri && (
                  <>
                    <Text className="font-psemibold text-lg py-2">Disease Detected</Text>
                    <View className="relative items-center justify-center">
                      <Image source={{ uri: imageUri }} className="w-52 h-52 rounded-md" resizeMode="cover" />
                      {isLoading && (
                        <View className="absolute w-52 h-52 bg-black/60 items-center justify-center rounded-md">
                          <ActivityIndicator size="large" color="#FFF" />
                          <Text className="text-white mt-2 text-sm font-pmedium">Scanning Image...</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>

              <View className="flex-row items-center justify-center gap-2">
                  <View className="">
                        {/* Combined Overlay */}
                    
                      {overlayUri && (
                        <>
                          <Text className="mt-3 text-base font-semibold text-gray-700">
                            Image with Detected Mask
                          </Text> 
                          <Image source={{ uri: overlayUri }} className="w-52 h-52 rounded-md mt-1" />
                        </>
                      )}
                  </View>
                      {overlayUri && (
                        <View className="flex items-start justify-center">

                          <View className="flex-row items-center justify-center mb-1">
                            <View className="h-1.5 w-3 bg-[#0000ff] mr-1 rounded-full" />
                            <Text className="text-xs font-pregular">Calculus</Text>
                          </View>

                          <View className="flex-row items-center justify-center mb-1">
                            <View className="h-1.5 w-3 bg-[#00ff00] mr-1 rounded-full" />
                            <Text className="text-xs font-pregular">Caries</Text>
                          </View>

                          <View className="flex-row items-center justify-center mb-1">
                            <View className="h-1.5 w-3 bg-[#ff0000] mr-1 rounded-full" />
                            <Text className="text-xs font-pregular">Gingivitis</Text>
                          </View>

                          <View className="flex-row items-center justify-center mb-1">
                            <View className="h-1.5 w-3 bg-[#00ffff] mr-1 rounded-full" />
                            <Text className="text-xs font-pregular">Hypodontia</Text>
                          </View>

                                              <View className="flex-row items-center justify-center mb-1">
                            <View className="h-1.5 w-3 bg-[#ff00ff] mr-1 rounded-full" />
                            <Text className="text-xs font-pregular">Tooth-Discoloration</Text>
                          </View>

                          <View className="flex-row items-center justify-center mb-1">
                            <View className="h-1.5 w-3 bg-[#ffff00] mr-1 rounded-full" />
                            <Text className="text-xs font-pregular">Mouth Ulcer</Text>
                          </View>
                          
                        </View>
                      )}

              </View>

            </View>

            {/* Upload / Camera Prompt */}
            {captureUploadBTN && (
              <View className="w-full min-h-full items-center justify-center">
                <Image source={icons.imageOutline} className="w-40 h-40 mb-5" resizeMode="contain" />
                <Text className="text-center text-base font-plight text-gray-700 px-6 mb-4">
                  Please upload or capture a clear image of your oral cavity to begin analysis.
                  Make sure the area is well-lit and focused for accurate predictions.
                </Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => setIsCameraActive(true)}
                    className="bg-white border-[1px] border-secondary-100 px-6 py-3 rounded-lg"
                  >
                    <Text className="text-secondary font-semibold text-base">Use Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pickImage}
                    className="bg-secondary px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-base">Upload Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Prediction */}
            {prediction !== "" && (
              <View className="items-center mt-4 w-full">
                <Text className="text-lg font-semibold text-secondary capitalize">{prediction}</Text>


                {/* Per-Class Overlays */}
                {classMasks.length > 0 && (
                  <>
                    <Text className="mt-3 text-base font-semibold text-gray-700">
                      Per-Class Overlays
                    </Text>
                    {classMasks.map((m, idx) => (
                      <View key={idx} className="items-center mt-2">
                        <Text className="font-medium text-secondary">{m.class}</Text>
                        <Image source={{ uri: m.uri }} className="w-48 h-48 rounded-xl mt-1" />
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}

            

{detections.length > 0 && (
  <View className="bg-gray-100/40 rounded-xl p-4 w-full mt-4">
    {detections.map((d, idx) => (
      <View key={idx} className="mb-4">
        <Text className="text-lg font-semibold text-secondary capitalize">Disease Name: {d.class}</Text>
        
        <Text className="text-base font-pmedium  mt-1 mb-1">Treatment:</Text>
        <Text className="text-sm font-plight text-gray-700">{d.treatment}</Text>

        <Text className="text-base font-pmedium  mt-1 mb-1">Recommendation:</Text>
        <Text className="text-sm font-plight text-gray-700">{d.recommendation}</Text>

        <Text className="text-base font-pmedium  mt-1 mb-1">Prevention:</Text>
        <Text className="text-sm font-plight text-gray-700">{d.prevention}</Text>

        <Text className="text-xs text-blue-600 mt-2">Source: {d.source}</Text>
      </View>
    ))}
  </View>
)}



            {/* Reset Button */}
            {/* captureUploadNew */}
            {captureUploadNew && (
                <View className="flex-row p-2 gap-2 py-7">
                  <TouchableOpacity
                    onPress={CaptureUploadNew}
                    className="bg-white border-[2px] border-secondary-100 px-3 py-2 rounded-full flex-row items-center justify-center"
                  >
                    <Image source={icons.camera} className="w-7 h-7" resizeMode="contain" />
                    <Text className="text-secondary-100 font-psemibold ml-2 text-xs">New</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={CaptureUploadNew}
                    className="bg-white border-[2px] border-secondary-100 px-3 py-2 rounded-full flex-row items-center justify-center"
                  >
                    <Image source={icons.download} className="w-7 h-7" resizeMode="contain" />
                    <Text className="text-secondary-100 font-psemibold ml-2 text-xs">Download</Text>
                  </TouchableOpacity>

                </View>
            )}
          </ScrollView>
        )}
      </View>
      <StatusBar backgroundColor="#36A2A4" style="dark" />
    </SafeAreaView>
  );
};

export default Home;
