
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "metaroll-rewards",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectData() {
  console.log("Fetching sample transactions...");
  const q = query(collection(db, "wallet_history"), limit(10));
  const snapshot = await getDocs(q);
  
  snapshot.forEach(doc => {
    console.log("ID:", doc.id, "Data:", JSON.stringify(doc.data(), null, 2));
  });

  console.log("\nFetching sample dealers...");
  const dq = query(collection(db, "dealers"), limit(5));
  const dsnapshot = await getDocs(dq);
  dsnapshot.forEach(doc => {
    console.log("ID:", doc.id, "Data:", JSON.stringify(doc.data(), null, 2));
  });
}

inspectData().catch(console.error);
