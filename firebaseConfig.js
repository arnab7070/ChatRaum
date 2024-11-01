import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCv9x-PVzEVLs-nnQP8tQUe6lpjYRJ4bNs",
  authDomain: "codinghub-1a9d4.firebaseapp.com",
  projectId: "codinghub-1a9d4",
  storageBucket: "codinghub-1a9d4.appspot.com",
  messagingSenderId: "861589710795",
  appId: "1:861589710795:web:a80bbad299d63745c3784e",
  measurementId: "G-KQVH667ZG3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { db, storage }; // Export Firestore and Storage
