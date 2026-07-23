import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Get Firebase ID token and set it for API calls
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);

        // Check if profile is complete in Firestore
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileComplete(docSnap.data().profileComplete === true);
          } else {
            setProfileComplete(false);
          }
        } catch (error) {
          setProfileComplete(false);
        }
      } else {
        setUser(null);
        setProfileComplete(false);
        setAuthToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profileComplete, setProfileComplete, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}