import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4TemiF3UA_8JgiMaIRomDui9yWLrPv5E",
  authDomain: "fuj2026-f22a7.firebaseapp.com",
  projectId: "fuj2026-f22a7",
  storageBucket: "fuj2026-f22a7.firebasestorage.app",
  messagingSenderId: "317798902491",
  appId: "1:317798902491:web:3d77bf408bf0e9e2e57afe",
  measurementId: "G-2YS4M0XVDS"
};

// Initialize Firebase only if it hasn't been initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

