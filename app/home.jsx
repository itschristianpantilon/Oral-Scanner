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
      console.log("🔍 API Result:", result);

      if (result.detections && result.detections.length > 0) {
        const diseases = result.detections.map(
          (d) => `${d.class} (${(d.confidence * 100).toFixed(1)}%)`
        );
        setPrediction(`Detected: ${diseases.join(", ")}`);

        // ✅ Combined overlay image
        if (result.result_image_base64) {
          setOverlayUri(`data:image/png;base64,${result.result_image_base64}`);
        }

        // ✅ Per-class overlays (from backend's per_class_overlays)
        if (result.per_class_overlays) {
          const overlays = result.per_class_overlays.map((d) => ({
            class: d.class,
            uri: `data:image/png;base64,${d.mask_base64}`,
          }));
          setClassMasks(overlays);
        }
      } else {
        setPrediction("No disease detected.");
        setOverlayUri(null);
        setClassMasks([]);
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
          <Image source={icons.textOnly} className="w-20 h-10" resizeMode="contain" />
        </View>
      </View>

      {/* Main Content */}
      <View className="w-full items-center justify-center">
        {isCameraActive ? (
          // 📸 Camera View
          <View className="w-[90%] h-full rounded-xl items-center justify-evenly">
            <View className="items-center justify-center">
              <View className="border-[2px] rounded-xl border-secondary p-3">
                <CameraView
                  className="w-72 h-72 rounded-xl"
                  facing={cameraType}
                  flash={flash}
                  ref={cameraRef}
                />
              </View>
              <Text className="text-justify text-sm font-plight text-gray-700 px-4 my-7">
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
            {imageUri && (
              <View className="relative items-center justify-center">
                <Image source={{ uri: imageUri }} className="w-72 h-72 rounded-xl" resizeMode="cover" />
                {isLoading && (
                  <View className="absolute w-72 h-72 bg-black/60 items-center justify-center rounded-xl">
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text className="text-white mt-2 text-sm font-pmedium">Analyzing Image...</Text>
                  </View>
                )}
              </View>
            )}

            {/* Upload / Camera Prompt */}
            {captureUploadBTN && (
              <View className="items-center justify-center h-full mt-6">
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
              <View className="items-center mt-6 w-full">
                <Text className="text-lg font-semibold text-secondary">
                  {prediction}
                </Text>

                {/* Combined Overlay */}
                {overlayUri && (
                  <>
                    <Text className="mt-3 text-base font-semibold text-gray-700">
                      Detection Overlay
                    </Text>
                    <Image source={{ uri: overlayUri }} className="w-72 h-72 rounded-xl mt-2" />
                  </>
                )}

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

            {/* Treatment & Tips */}
            {treatmentPlan !== "" && (
              <View className="bg-gray-100/40 rounded-xl p-4 w-full mt-4">
                <Text className="text-base font-semibold text-secondary mb-1">Treatment Plan:</Text>
                <Text className="text-sm text-gray-700">{treatmentPlan}</Text>
                <Text className="text-base font-semibold text-secondary mt-2 mb-1">
                  Recommendations:
                </Text>
                <Text className="text-sm text-gray-700">{healthTips}</Text>
              </View>
            )}

            {/* Reset Button */}
            {captureUploadNew && (
              <View className="flex-row w-full justify-end mt-4">
                <TouchableOpacity
                  onPress={CaptureUploadNew}
                  className="bg-white border-[1px] border-secondary-100 p-3 rounded-full"
                >
                  <Image source={icons.camera} className="w-9 h-9" resizeMode="contain" />
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
