import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || 'user');
          setProfileCompleted(userData.profileCompleted || false);
        } else {
          setUserRole('user');
          setProfileCompleted(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setProfileCompleted(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signup = async (email, password, userData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    if (userData.fullName) {
      await updateProfile(user, { displayName: userData.fullName });
    }
    
    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email: user.email,
      role: 'user', // Default role
      profileCompleted: true, // Profile is completed during email registration
      createdAt: new Date().toISOString(),
    });
    
    return user;
  };

  // Sign in with email and password
  const login = async (email, password) => {
    console.log('🔐 Attempting login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase auth successful, checking approval status...');
    
    // Check if user is approved
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📋 User data:', { role: userData.role, approved: userData.approved });
      
      // Check if account is approved (admins are always approved)
      if (userData.role !== 'admin' && userData.approved === false) {
        console.log('❌ Account not approved, signing out...');
        // Sign out the user immediately
        await signOut(auth);
        throw new Error('Your account is pending approval. Please wait for admin confirmation.');
      }
      
      console.log('✅ Account approved, login successful!');
    } else {
      console.warn('⚠️ User document not found in Firestore');
    }
    
    return userCredential;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    console.log('🔐 Attempting Google sign-in...');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log('✅ Google auth successful, checking user data...');
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('📝 New Google user, creating basic profile...');
      // Create user document for new Google users (profile incomplete)
      await setDoc(doc(db, 'users', user.uid), {
        fullName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        approved: false, // Google users need approval after completing profile
        profileCompleted: false, // Google users need to complete profile
        createdAt: new Date().toISOString(),
      });
      console.log('✅ Basic profile created. User needs to complete profile.');
      // Return with profileCompleted: false to trigger redirect to complete-profile page
      return { user, needsProfileCompletion: true };
    } else {
      // Check if existing user is approved
      const userData = userDoc.data();
      console.log('📋 Existing Google user data:', { role: userData.role, approved: userData.approved, profileCompleted: userData.profileCompleted });
      
      // Check if profile is not completed yet
      if (!userData.profileCompleted) {
        console.log('⚠️ Profile not completed, redirect to complete-profile');
        return { user, needsProfileCompletion: true };
      }
      
      // Check if account is not approved yet
      if (userData.role !== 'admin' && userData.approved === false) {
        console.log('❌ Google account not approved, signing out...');
        await signOut(auth);
        throw new Error('Your account is pending approval. Please wait for admin confirmation.');
      }
      
      console.log('✅ Google account approved, login successful!');
    }
    
    return { user, needsProfileCompletion: false };
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userRole,
    profileCompleted,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    isAdmin: userRole === 'admin',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

