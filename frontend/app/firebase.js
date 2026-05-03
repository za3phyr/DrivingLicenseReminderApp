import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTN9cwcKB2xNmi4UZz48j9VmYGdvsA6x4",
  authDomain: "driving-license-renewal-app.firebaseapp.com",
  projectId: "driving-license-renewal-app",
  storageBucket: "driving-license-renewal-app.firebasestorage.app",
  messagingSenderId: "562250465780",
  appId: "1:562250465780:web:46deea058c369fcccf79a1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);