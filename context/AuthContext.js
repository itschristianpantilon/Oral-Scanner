import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore, googleProvider, isGoogleSigninAvailable, Google } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Google Sign-In request configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "807145722118-your-android-client-id.apps.googleusercontent.com", // Replace with your Android client ID
    iosClientId: "807145722118-your-ios-client-id.apps.googleusercontent.com", // Replace with your iOS client ID
    webClientId: "807145722118-your-web-client-id.apps.googleusercontent.com", // Replace with your Web client ID
  });

  useEffect(() => {
    let isMounted = true;
    
    // Set Firebase Auth persistence and initialize
    const initializeAuth = async () => {
      try {
        if (Platform.OS === 'web') {
          await setPersistence(auth, browserLocalPersistence);
        }
        
        // Check for guest session in AsyncStorage
        const guestSession = await AsyncStorage.getItem('guestSession');
        if (guestSession === 'true' && isMounted) {
          setIsGuest(true);
        }
      } catch (error) {
        console.error('Error setting persistence:', error);
      }
    };

    initializeAuth();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!isMounted) return;
      
      console.log('Auth state changed:', authUser ? 'User logged in' : 'No user');
      
      if (authUser) {
        setUser(authUser);
        setIsGuest(false);
        // Clear guest session if user signs in
        try {
          await AsyncStorage.removeItem('guestSession');
        } catch (error) {
          console.error('Error removing guest session:', error);
        }
      } else {
        setUser(null);
        // If no user, check if there's a guest session
        try {
          const guestSession = await AsyncStorage.getItem('guestSession');
          if (guestSession === 'true') {
            setIsGuest(true);
          } else {
            setIsGuest(false);
          }
        } catch (error) {
          console.error('Error checking guest session:', error);
          setIsGuest(false);
        }
      }
      
      setLoading(false);
      setInitializing(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignInSuccess(authentication.accessToken, authentication.idToken);
    }
  }, [response]);

  const handleGoogleSignInSuccess = async (accessToken, idToken) => {
    try {
      setLoading(true);
      
      // Create Firebase credential
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      
      // Sign in with Firebase
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      
      // Store user data in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        history: [],
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error('Google Sign-In Error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web platform, use signInWithPopup
        const { signInWithPopup } = await import('firebase/auth');
        setLoading(true);
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Store user data in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          history: [],
          lastLoginAt: serverTimestamp()
        }, { merge: true });

        setLoading(false);
        return { success: true };
      } else {
        // For mobile platforms, use Expo Auth Session
        const result = await promptAsync();
        if (result.type === 'success') {
          // The success will be handled by the useEffect above
          return { success: true };
        } else if (result.type === 'cancel') {
          return { success: false, error: 'Sign-in cancelled' };
        } else {
          return { success: false, error: 'Sign-in failed' };
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Google Sign-In Error:', error);
      
      // Handle specific Google Sign-In errors
      let errorMessage = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in attempt is in progress.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email address but different sign-in method.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Ensure user document exists in Firestore and update last login
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          displayName: userCredential.user.displayName || 'User',
          email: userCredential.user.email,
          createdAt: serverTimestamp(),
          history: [],
          lastLoginAt: serverTimestamp()
        });
      } else {
        // Update last login time
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error('Email Sign-In Error:', error);
      
      // Handle specific error messages
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Store user data in Firestore
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        displayName: fullName,
        email: email,
        createdAt: serverTimestamp(),
        history: [],
        lastLoginAt: serverTimestamp()
      });

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error('Email Sign-Up Error:', error);
      
      // Handle specific error messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuest(false);
      // Clear guest session
      await AsyncStorage.removeItem('guestSession');
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  const continueAsGuest = async () => {
    setIsGuest(true);
    setUser(null);
    // Store guest session in AsyncStorage
    try {
      await AsyncStorage.setItem('guestSession', 'true');
    } catch (error) {
      console.error('Error saving guest session:', error);
    }
  };

  const addToHistory = async (diseaseData) => {
    if (!user && !isGuest) return;

    const historyItem = {
      id: Date.now().toString(),
      disease: diseaseData.disease,
      confidence: diseaseData.confidence,
      image: diseaseData.image,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    };

    if (user) {
      // Save to Firestore for authenticated users
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
          history: arrayUnion(historyItem)
        });
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    } else if (isGuest) {
      // Save to AsyncStorage for guest users
      try {
        const existingHistory = await AsyncStorage.getItem('guestHistory');
        const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
        historyArray.push(historyItem);
        await AsyncStorage.setItem('guestHistory', JSON.stringify(historyArray));
      } catch (error) {
        console.error('Error saving guest history:', error);
      }
    }
  };

  const getHistory = async () => {
    if (user) {
      // Get from Firestore for authenticated users
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          return userDoc.data().history || [];
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    } else if (isGuest) {
      // Get from AsyncStorage for guest users
      try {
        const guestHistory = await AsyncStorage.getItem('guestHistory');
        return guestHistory ? JSON.parse(guestHistory) : [];
      } catch (error) {
        console.error('Error fetching guest history:', error);
      }
    }

    return [];
  };

  // Clear all session data (useful for debugging)
  const clearAllSessions = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('guestSession');
      await AsyncStorage.removeItem('guestHistory');
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  };

  const value = {
    user,
    loading,
    isGuest,
    initializing,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut: handleSignOut,
    continueAsGuest,
    addToHistory,
    getHistory,
    clearAllSessions,
    isLoggedIn: !!user || isGuest,
    isGoogleSigninAvailable
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};