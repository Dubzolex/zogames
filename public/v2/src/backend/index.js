import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";


const firebaseConfig = {
  apiKey: "AIzaSyAxzMqlfPiXqH65fN4A_ZQ8g4yAhNZK6NA",
  authDomain: "enzo-projet.firebaseapp.com",
  projectId: "enzo-projet",
  storageBucket: "enzo-projet.firebasestorage.app",
  messagingSenderId: "509431405679",
  appId: "1:509431405679:web:a3623be821a74149bb819a",
  measurementId: "G-WHNMXCK889"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
export const db = getFirestore(app);

// Initialiser Auth
export const auth = getAuth(app);

// Initialiser Firebase Functions
export const functions = getFunctions(app);