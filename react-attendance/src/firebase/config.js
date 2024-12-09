import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJEkhpI4NNgWWozGbYpPJNvLIrvI9n4tk",
  authDomain: "attendance-tracker-e5bcb.firebaseapp.com",
  projectId: "attendance-tracker-e5bcb",
  storageBucket: "attendance-tracker-e5bcb.firebasestorage.app",
  messagingSenderId: "3413302265",
  appId: "1:3413302265:web:49670c79ecbd1488bbfb28",
  measurementId: "G-VNH05CJCTQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
