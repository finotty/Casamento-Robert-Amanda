import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM1oA1xH-0vh0Wq1fOecxXcTQwFpVG0vE",
  authDomain: "gastos-8557b.firebaseapp.com",
  databaseURL: "https://gastos-8557b-default-rtdb.firebaseio.com",
  projectId: "gastos-8557b",
  storageBucket: "gastos-8557b.firebasestorage.app",
  messagingSenderId: "304415632556",
  appId: "1:304415632556:web:00e17d609e04a423278309"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

export default app;
