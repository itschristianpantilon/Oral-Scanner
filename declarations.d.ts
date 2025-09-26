declare module "react-native-tflite" {
  interface LoadModelOptions {
    model: string;
    labels?: string;
  }

  interface RunModelOnImageOptions {
    path: string;
    imageMean?: number;
    imageStd?: number;
    numResults?: number;
    threshold?: number;
  }

  type PredictionResult = {
    index: number;
    label: string;
    confidence: number;
  };

  export function loadModel(
    options: LoadModelOptions,
    callback: (err: any, res: any) => void
  ): void;

  export function runModelOnImage(
    options: RunModelOnImageOptions,
    callback: (err: any, res: PredictionResult[]) => void
  ): void;
}
