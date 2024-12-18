import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAMDlmHwwKvnipr8egwQfYkdwEBLlkodTQ",
    authDomain: "trade-simulator-35ce0.firebaseapp.com",
    projectId: "trade-simulator-35ce0",
    storageBucket: "trade-simulator-35ce0.firebasestorage.app",
    messagingSenderId: "32191864339",
    appId: "1:32191864339:web:eb473df7a79dad290529e6",
    measurementId: "G-Z3HW5SB056"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
