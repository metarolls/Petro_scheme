
import { db } from './src/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function checkData() {
  console.log("Checking Dealers...");
  const dealersSnap = await getDocs(query(collection(db, "dealers"), limit(5)));
  dealersSnap.forEach(doc => {
    console.log(`Dealer: ${doc.id}`, doc.data());
  });

  console.log("\nChecking Transactions...");
  const txnsSnap = await getDocs(query(collection(db, "transactions"), limit(10)));
  txnsSnap.forEach(doc => {
    console.log(`Txn: ${doc.id}`, doc.data());
  });
}

checkData().catch(console.error);
