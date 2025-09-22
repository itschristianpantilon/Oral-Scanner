// // Firebase JS SDK configuration for Expo
// import { initializeApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { Platform } from 'react-native';

// // Your Firebase config from the google-services.json
// const firebaseConfig = {
//   apiKey: "AIzaSyA_yD8UiUmtMX7ZDFqTiHHa8A73g3i0rdg",
//   authDomain: "dental-ai-app-b1a8d.firebaseapp.com",
//   projectId: "dental-ai-app-b1a8d",
//   storageBucket: "dental-ai-app-b1a8d.firebasestorage.app",
//   messagingSenderId: "807145722118",
//   appId: "1:807145722118:android:37e7547073499cd044ce87"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Auth
// const auth = getAuth(app);

// // Initialize Firestore
// const firestore = getFirestore(app);

// // Google Auth Provider
// const googleProvider = new GoogleAuthProvider();

// // Configure Google Auth Provider
// googleProvider.setCustomParameters({
//   prompt: 'select_account'
// });

// // Configure WebBrowser for Expo
// WebBrowser.maybeCompleteAuthSession();

// // Check if Google Sign-In is available (only on mobile platforms)
// const isGoogleSigninAvailable = Platform.OS !== 'web';

// export { 
//   auth, 
//   firestore, 
//   googleProvider, 
//   isGoogleSigninAvailable,
//   app,
//   Google,
//   WebBrowser
// };