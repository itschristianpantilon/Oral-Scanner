import { useTensorflowModel } from "react-native-fast-tflite";

export function useBundledTFLiteModel() {
  // On Android, assets are available via the /android_asset path
const { model, error, loading } = useTensorflowModel({
  url: "file:///android_asset/models/best_float16.tflite",
});


  return { model, error, loading };
}
