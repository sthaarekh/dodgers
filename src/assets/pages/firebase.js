// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ0TWPVX2xXzG8irsdcES3zzUM3vi1Tek",
  authDomain: "dodgers-3ca7e.firebaseapp.com",
  databaseURL: "https://dodgers-3ca7e-default-rtdb.firebaseio.com",
  projectId: "dodgers-3ca7e",
  storageBucket: "dodgers-3ca7e.firebasestorage.app",
  messagingSenderId: "567348118217",
  appId: "1:567348118217:web:8fedab3ce01e7ed1ae8318",
  measurementId: "G-CCN8EX9LSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);