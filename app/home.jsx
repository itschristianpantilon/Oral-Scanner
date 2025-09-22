import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import icons from "../constants/icons";
import { router } from "expo-router";
import Tflite from "react-native-tflite";
import { Asset } from "expo-asset";
import * as FileSystem from 'expo-file-system';

const Home = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef(null);

  const [captureUploadBTN, setCaptureUploadBTN] = useState(true);
  const [captureUploadNew, setCaptureUploadNew] = useState(false);

  const [prediction, setPrediction] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [healthTips, setHealthTips] = useState("");
  const [confidence, setConfidence] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [flash, setFlash] = useState("off");
  const [cameraType, setCameraType] = useState("back");

  const [tflite, setTflite] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState("");

  // ✅ Alternative model loading methods
  const loadModelMethod1 = async () => {
    console.log("🔄 Attempting Method 1: Asset.fromModule...");
    
    const modelAsset = Asset.fromModule(
      require("../assets/model/yolov8.tflite")
    );
    await modelAsset.downloadAsync();
    
    console.log("📁 Model asset downloaded:", modelAsset.localUri);
    return modelAsset.localUri;
  };

  const loadModelMethod2 = async () => {
    console.log("🔄 Attempting Method 2: FileSystem bundled asset...");
    
    // Try using FileSystem to get the bundled asset
    const modelUri = `${FileSystem.bundleDirectory}assets/model/yolov8.tflite`;
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(modelUri);
    if (fileInfo.exists) {
      console.log("📁 Found bundled model at:", modelUri);
      return modelUri;
    } else {
      throw new Error("Bundled model file not found");
    }
  };

  const loadModelMethod3 = async () => {
    console.log("🔄 Attempting Method 3: Direct require path...");
    
    // This method uses the direct path - works in some cases
    const modelPath = "../assets/model/yolov8.tflite";
    return modelPath;
  };

  const loadModelMethod4 = async () => {
    console.log("🔄 Attempting Method 4: Copy to document directory...");
    
    // Copy model to document directory first
    const modelAsset = Asset.fromModule(
      require("../assets/model/yolov8.tflite")
    );
    
    const modelUri = `${FileSystem.documentDirectory}yolov8.tflite`;
    
    // Check if already copied
    const fileInfo = await FileSystem.getInfoAsync(modelUri);
    if (!fileInfo.exists) {
      console.log("📁 Copying model to document directory...");
      await FileSystem.copyAsync({
        from: modelAsset.localUri || modelAsset.uri,
        to: modelUri,
      });
    }
    
    console.log("📁 Model copied to:", modelUri);
    return modelUri;
  };

  // ✅ Load model with multiple fallback methods
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("🔄 Loading TFLite model...");
        
        let modelPath = null;
        let lastError = null;

        // Try different methods in order
        const methods = [
          loadModelMethod2, // FileSystem bundled (most reliable)
          loadModelMethod4, // Copy to document directory
          loadModelMethod1, // Asset.fromModule (original)
          loadModelMethod3, // Direct path (fallback)
        ];

        for (let i = 0; i < methods.length; i++) {
          try {
            modelPath = await methods[i]();
            console.log(`✅ Method ${i + 1} succeeded: ${modelPath}`);
            break;
          } catch (error) {
            console.log(`❌ Method ${i + 1} failed:`, error.message);
            lastError = error;
            continue;
          }
        }

        if (!modelPath) {
          throw lastError || new Error("All model loading methods failed");
        }

        // Initialize TFLite with the successful path
        const tfliteInstance = new Tflite();
        
        // Load model with promise-based approach
        const loadModelPromise = new Promise((resolve, reject) => {
          tfliteInstance.loadModel(
            {
              model: modelPath,
              // labels: "labels.txt", // Comment out if you don't have labels file
            },
            (err, res) => {
              if (err) {
                console.log("❌ TFLite loadModel error:", err);
                reject(err);
              } else {
                console.log("✅ TFLite model loaded successfully:", res);
                resolve(res);
              }
            }
          );
        });

        await loadModelPromise;
        setTflite(tfliteInstance);
        setModelLoaded(true);
        setModelError("");
        console.log("🎯 Model ready for use");
        
      } catch (error) {
        console.log("💥 All model loading methods failed:", error);
        setModelError(error.message);
        
        // For development - still allow app to function without model
        Alert.alert(
          "Model Loading Error", 
          `Failed to load the AI model: ${error.message}\n\nYou can still use the camera, but predictions won't work.`,
          [
            { text: "Continue Anyway", style: "default" },
            { text: "Go Back", onPress: () => router.back(), style: "cancel" }
          ]
        );
      }
    };

    loadModel();
  }, []);

  // ✅ Ask for camera permission with better error handling
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === "granted");
        
        if (status !== "granted") {
          Alert.alert(
            "Camera Permission Required",
            "This app needs camera access to function properly.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.log("❌ Permission request error:", error);
        setHasCameraPermission(false);
      }
    };

    requestPermissions();
  }, []);

  // ✅ Toggle flash with safety checks
  const toggleFlash = () => {
    if (cameraType === "front") {
      console.log("Flash not available on front camera");
      return;
    }
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  };

  // ✅ Switch front/back camera
  const switchCamera = () => {
    const newType = cameraType === "back" ? "front" : "back";
    setCameraType(newType);
    if (newType === "front") setFlash("off");
  };

  // ✅ Predict image locally with TFLite - Fixed with better error handling
  const predictImage = async (uri) => {
    if (!tflite || !modelLoaded) {
      console.log("⚠️ Model not loaded yet");
      
      if (modelError) {
        Alert.alert(
          "Model Not Available", 
          `AI model failed to load: ${modelError}\n\nPlease restart the app or contact support.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Model Not Ready", "Please wait for the AI model to load completely.");
      }
      return;
    }
    
    setIsLoading(true);

    const classMap = {
      0: "Calculus",
      1: "Caries",
      2: "Gingivitis",
      3: "Hypodontia",
      4: "Tooth Discoloration",
      5: "Ulcers",
    };

    const treatmentMap = {
      Calculus: {
        treatment:
          "Professional dental cleaning to remove plaque and tartar using ultrasonic instruments or hand scalers.",
        recommendation:
          "Brush twice daily with fluoride toothpaste and floss once a day. Regular dental cleanings every 6 months are essential.",
      },
      Caries: {
        treatment:
          "Cavities are treated by removing decayed material and filling the area. Severe decay may require a root canal or crown.",
        recommendation:
          "Limit sugary snacks and drinks. Brush with fluoride toothpaste, floss daily, and get regular check-ups.",
      },
      Gingivitis: {
        treatment:
          "Mild gum inflammation can be reversed with professional cleaning and better oral hygiene.",
        recommendation:
          "Use antiseptic mouthwash and floss daily to remove plaque between teeth. Avoid tobacco use.",
      },
      Hypodontia: {
        treatment:
          "Treatment depends on the number and position of missing teeth. It may include orthodontics, dentures, or implants.",
        recommendation:
          "Children with missing teeth should be monitored regularly. A dental specialist can create a long-term plan.",
      },
      "Tooth Discoloration": {
        treatment:
          "Whitening treatments include bleaching, at-home trays, or veneers for intrinsic stains.",
        recommendation:
          "Reduce coffee, tea, red wine, and tobacco. Rinse your mouth after stain-causing foods.",
      },
      Ulcers: {
        treatment:
          "Minor ulcers heal on their own, but topical gels or antimicrobial rinses can reduce pain and speed recovery.",
        recommendation:
          "Avoid spicy/acidic foods, stay hydrated, and maintain oral hygiene. Consult a dentist if ulcers persist >2 weeks.",
      },
    };

    try {
      const predictionPromise = new Promise((resolve, reject) => {
        tflite.runModelOnImage(
          {
            path: uri,
            imageMean: 0.0,
            imageStd: 255.0,
            numResults: 6,
            threshold: 0.2,
          },
          (err, res) => {
            if (err) {
              console.log("❌ Prediction error:", err);
              reject(err);
            } else {
              console.log("🔮 Predictions:", res);
              resolve(res);
            }
          }
        );
      });

      const res = await predictionPromise;

      if (res && res.length > 0) {
        const topResult = res[0];
        const diseaseName = classMap[topResult.index] || "Unknown";
        setPrediction(`Disease: ${diseaseName}`);
        setConfidence(`${(topResult.confidence * 100).toFixed(1)}%`);

        if (treatmentMap[diseaseName]) {
          setTreatmentPlan(treatmentMap[diseaseName].treatment);
          setHealthTips(treatmentMap[diseaseName].recommendation);
        } else {
          setTreatmentPlan("No treatment plan available for this classification.");
          setHealthTips("Please consult with a dental professional for proper diagnosis.");
        }
      } else {
        setPrediction("No clear diagnosis detected");
        setConfidence("N/A");
        setTreatmentPlan("Please try with a clearer image or consult a dentist.");
        setHealthTips("Maintain good oral hygiene and regular dental check-ups.");
      }
    } catch (error) {
      console.log("💥 Prediction failed:", error);
      Alert.alert(
        "Analysis Error", 
        `Failed to analyze the image: ${error.message}\n\nPlease try again with a different image.`,
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Reset for new capture/upload
  const CaptureUploadNew = () => {
    setImageUri(null);
    setCaptureUploadBTN(true);
    setCaptureUploadNew(false);
    setPrediction("");
    setTreatmentPlan("");
    setHealthTips("");
    setConfidence("");
  };

  // ✅ Trigger prediction when new image is set
  useEffect(() => {
    if (imageUri && modelLoaded) {
      setCaptureUploadNew(true);
      setCaptureUploadBTN(false);
      predictImage(imageUri);
    } else if (imageUri && !modelLoaded) {
      // Show image but don't predict
      setCaptureUploadNew(true);
      setCaptureUploadBTN(false);
    }
  }, [imageUri, modelLoaded]);

  // ✅ Capture photo with error handling
  const takePicture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setImageUri(photo.uri);
        setIsCameraActive(false);
      }
    } catch (error) {
      console.log("❌ Camera capture error:", error);
      Alert.alert("Camera Error", "Failed to capture photo. Please try again.");
    }
  };

  // ✅ Pick image from gallery with error handling
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("❌ Image picker error:", error);
      Alert.alert("Image Selection Error", "Failed to select image. Please try again.");
    }
  };

  // ✅ Handle camera permissions
  if (hasCameraPermission === null) {
    return (
      <SafeAreaView className="bg-white items-center justify-center h-full">
        <ActivityIndicator size="large" color="#36A2A4" />
        <Text className="mt-4 text-gray-600">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }
  
  if (hasCameraPermission === false) {
    return (
      <SafeAreaView className="bg-white items-center justify-center h-full px-4">
        <Text className="text-center text-gray-600 mb-4">
          Camera access is required for this app to function properly.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-secondary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white items-center h-full w-full">
      {/* Header */}
      <View className="bg-white w-full min-h-[50px] mt-1 flex-row items-center justify-between relative">
        <TouchableOpacity className="px-3" onPress={() => router.back()}>
          <Image source={icons.back} className="w-8 h-8" resizeMode="contain" />
        </TouchableOpacity>
        <View className="flex-row justify-center items-center absolute w-full h-full">
          <Image
            source={icons.logoOnly}
            className="w-10 h-10"
            resizeMode="contain"
          />
          <Image
            source={icons.textOnly}
            className="w-20 h-10"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Body */}
      <View className="w-full items-center justify-center flex-1">
        {isCameraActive ? (
          // Camera View
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
              <Text className="text-justify text-sm font-plight text-gray-700 px-4 my-7 w-auto">
                Ensure the image is focused, close to the mouth, and not blurry.
                Keep the camera about 5–10 cm from the teeth.
              </Text>
            </View>

            {/* Camera Controls */}
            <View className="flex-row w-full items-start justify-evenly h-36">
              <TouchableOpacity
                onPress={toggleFlash}
                className={`border-[2px] border-secondary justify-center items-center rounded-full w-12 h-12 p-3 ${
                  flash === "on" ? "bg-secondary-100" : "bg-white"
                }`}
                disabled={cameraType === "front"}
              >
                <Image
                  source={
                    flash === "on" ? icons.flashlightWhite : icons.flashlight
                  }
                  className="w-full h-full"
                  resizeMode="contain"
                  style={{ opacity: cameraType === "front" ? 0.5 : 1 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePicture}
                className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-16 h-16 p-3"
              >
                <Image
                  source={icons.capture}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={switchCamera}
                className="bg-white border-[2px] border-secondary justify-center items-center rounded-full w-12 h-12 p-3"
              >
                <Image
                  source={icons.rotateIcon}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Results / Upload Area
          <View className="justify-start items-start w-full h-full">
            {imageUri && (
              <>
                <Text className="w-full text-base font-psemibold text-secondary px-4 py-3 text-center">
                  Classification Result
                </Text>
                <View className="relative items-center justify-center w-full">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-72 h-72 rounded-xl"
                    resizeMode="cover"
                  />
                  {isLoading && (
                    <View className="items-center justify-center border-[1px] rounded-xl bg-black/70 w-72 h-72 absolute">
                      <ActivityIndicator size="large" color="#FFF" />
                      <Text className="text-white mt-2 text-sm font-pmedium">
                        Analyzing Image
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Upload buttons */}
            {captureUploadBTN && (
              <View className="items-center justify-center h-full">
                <View className="w-44 h-44 p-1 mb-5">
                  <Image
                    source={icons.imageOutline}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-center text-base font-plight text-gray-700 px-6 mb-4">
                  Please upload or capture a clear image of your oral cavity to
                  begin analysis. Make sure the area is well-lit and focused for
                  accurate predictions.
                </Text>
                
                {/* Show model loading status */}
                {!modelLoaded && !modelError && (
                  <View className="items-center mb-4">
                    <ActivityIndicator size="small" color="#36A2A4" />
                    <Text className="text-sm text-gray-500 mt-1">Loading AI model...</Text>
                  </View>
                )}

                {/* Show model error status */}
                {modelError && (
                  <View className="items-center mb-4 px-4">
                    <Text className="text-sm text-red-600 text-center">
                      AI model failed to load. You can still take photos, but analysis won't be available.
                    </Text>
                  </View>
                )}
                
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => setIsCameraActive(true)}
                    className="bg-white border-[1px] border-secondary-100 px-6 py-3 rounded-lg"
                  >
                    <Text className="text-secondary font-semibold text-base">
                      Use Camera
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pickImage}
                    className="bg-secondary px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-base">
                      Upload Image
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Prediction results */}
            {prediction !== "" && (
              <View className="items-center mt-5 w-full">
                <Text className="text-lg font-semibold text-secondary">
                  {prediction}
                </Text>
                <Text className="text-lg font-semibold text-secondary">
                  Confidence Level: {confidence}
                </Text>
              </View>
            )}

            {/* Show message when model not loaded but image is present */}
            {imageUri && !modelLoaded && !prediction && !isLoading && (
              <View className="items-center mt-5 w-full px-4">
                <Text className="text-center text-gray-600">
                  {modelError 
                    ? "AI analysis is not available due to model loading error."
                    : "Waiting for AI model to load for analysis..."}
                </Text>
              </View>
            )}

            {/* Treatment / Tips */}
            <View className="p-4 w-full h-56 items-center justify-center ">
              {treatmentPlan !== "" && (
                <ScrollView className="bg-gray-100/40 rounded-xl p-4 h-full w-full">
                  <Text className="text-base font-semibold text-secondary mb-1">
                    Treatment Plan:
                  </Text>
                  <Text className="text-sm text-gray-700">{treatmentPlan}</Text>
                  <Text className="text-base font-semibold text-secondary mb-1 mt-2">
                    Recommendations:
                  </Text>
                  <Text className="text-sm text-gray-700">{healthTips}</Text>
                </ScrollView>
              )}
              {isLoading && (
                <View className="items-center justify-center mt-4 rounded-md p-4 absolute">
                  <ActivityIndicator size="large" color="#6B7280" />
                  <Text className="text-secondary mt-2 text-sm">
                    Providing Treatment & Tips...
                  </Text>
                </View>
              )}
            </View>

            {/* Capture again button */}
            {captureUploadNew && (
              <View className="flex-row gap-4 w-full justify-end px-4">
                <TouchableOpacity
                  onPress={CaptureUploadNew}
                  className="bg-white border-[1px] border-secondary-100 p-3 rounded-full"
                >
                  <Image
                    source={icons.camera}
                    className="w-9 h-9"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <StatusBar backgroundColor="#36A2A4" style="dark" />
    </SafeAreaView>
  );
};

export default Home;