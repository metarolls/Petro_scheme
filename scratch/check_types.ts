
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKMQWDb4dy3Fl5g7ceFKa64KdhhAmZ1CY",
  authDomain: "metaroll-rewards.firebaseapp.com",
  projectId: "metaroll-rewards",
  storageBucket: "metaroll-rewards.firebasestorage.app",
  messagingSenderId: "597806111672",
  appId: "1:597806111672:web:ecc4c01a86dccb7f290d4d",
  measurementId: "G-CLS8059QH0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function audit() {
  console.log("Checking wallet_history collection...");
  const q = query(collection(db, "wallet_history"), limit(20));
  const snapshot = await getDocs(q);
  
  const types = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    types.add(data.type);
    console.log(`ID: ${doc.id}, Type: ${data.type}, Region: ${data.region}, tmtMT: ${data.tmtMT}, amount: ${data.amount}`);
  });
  
  console.log("\nUnique types found:", Array.from(types));

  console.log("\nChecking transactions collection...");
  const q2 = query(collection(db, "transactions"), limit(20));
  const snapshot2 = await getDocs(q2);
  snapshot2.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, Type: ${data.type}, Region: ${data.region}, tmtMT: ${data.tmtMT}, amount: ${data.amount}`);
  });
}

audit().catch(console.error);
