const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Move .tflite into assetExts
config.resolver.assetExts = config.resolver.assetExts.concat(["tflite"]);
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== "tflite"
);

module.exports = config;
