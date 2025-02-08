import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDQHPhZZcvoq1RNimd0i7gqrR25m-W4ABQ",
  authDomain: "jbqueijos.firebaseapp.com",
  projectId: "jbqueijos",
  storageBucket: "jbqueijos.firebasestorage.app",
  messagingSenderId: "919239011111",
  appId: "1:919239011111:web:2ae93402ba444e76005702",
  measurementId: "G-23HTYYHXJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services we're using
export const auth = getAuth(app);
export const db = getFirestore(app);