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
      profileCompleted: true, // Email users complete profile during registration
      createdAt: new Date().toISOString(),
    });
    
    return user;
  };

  // Sign in with email and password
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document for new Google users (profile incomplete)
      await setDoc(doc(db, 'users', user.uid), {
        fullName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        profileCompleted: false, // Google users need to complete profile
        createdAt: new Date().toISOString(),
      });
    }
    
    return user;
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

