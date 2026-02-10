import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// මෙන්න මේ කොටස ඔයාගේ Firebase Console එකෙන් ගත්තු එකෙන් මාරු කරන්න
const firebaseConfig = {
  apiKey: "AIzaSyBufs8rtok2eO89OHuNRkKKnDph4FVYYZI",
  authDomain: "jabbaskitchen-9c697.firebaseapp.com",
  projectId: "jabbaskitchen-9c697",
  storageBucket: "jabbaskitchen-9c697.firebasestorage.app",
  messagingSenderId: "178403764692",
  appId: "1:178403764692:web:424453070e28a99412ce41"
};

// මේවා වෙනස් කරන්න එපා
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
