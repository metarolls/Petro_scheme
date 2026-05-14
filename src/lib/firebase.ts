import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// तुझ्या प्रोजेक्टची गुप्त माहिती (Config)
const firebaseConfig = {
  apiKey: "AIzaSyDKMQWDb4dy3Fl5g7ceFKa64KdhhAmZ1CY",
  authDomain: "metaroll-rewards.firebaseapp.com",
  projectId: "metaroll-rewards",
  storageBucket: "metaroll-rewards.firebasestorage.app",
  messagingSenderId: "597806111672",
  appId: "1:597806111672:web:ecc4c01a86dccb7f290d4d",
  measurementId: "G-CLS8059QH0"
};

import { initializeFirestore } from "firebase/firestore";

// Firebase सुरू करा
const app = initializeApp(firebaseConfig);

// आपण वापरणार असलेल्या सर्विसेस Export करा
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export default app;