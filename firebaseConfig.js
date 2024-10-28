import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore

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
// const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore

export { db }; // Export Firestore instance
