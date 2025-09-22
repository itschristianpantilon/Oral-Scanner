const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .tflite files and other ML model files
config.resolver.assetExts.push('tflite', 'txt', 'pb', 'model', 'bin');

// Ensure these extensions are handled properly
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;