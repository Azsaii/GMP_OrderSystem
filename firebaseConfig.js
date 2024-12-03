// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCs5WGSZMTP038XI_cm0vyYYAyFSNLfzFU',
  authDomain: 'mobile8-b37a5.firebaseapp.com',
  projectId: 'mobile8-b37a5',
  storageBucket: 'mobile8-b37a5.appspot.com',
  messagingSenderId: '738826135164',
  appId: '1:738826135164:web:d70b59a2eef10ba7fa4bf9',
  measurementId: 'G-EYV9GPDLCK',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
export { database, auth, firestore };
