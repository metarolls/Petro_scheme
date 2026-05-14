
import { db } from "../src/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

async function auditData() {
  console.log("Auditing dealers...");
  const dealersSnap = await getDocs(collection(db, "dealers"));
  const dealers = dealersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`Found ${dealers.length} dealers.`);

  const regions = ['Sambhajinagar', 'Jalgaon', 'Solapur', 'Jalna'];
  
  for (const region of regions) {
    console.log(`\n--- Region: ${region} ---`);
    const regionDealers = dealers.filter((d: any) => d.region === region);
    console.log(`Dealers in ${region}:`, regionDealers.map((d: any) => d.firmName));

    const historySnap = await getDocs(query(collection(db, "wallet_history"), where("type", "==", "allocation")));
    const allocations = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const regionAllocations = allocations.filter((txn: any) => {
        const dealer = dealers.find((d: any) => d.id === txn.dealerId || d.firmName === txn.dealerName);
        return txn.region === region || dealer?.region === region;
    });

    const totalWeight = regionAllocations.reduce((sum, txn: any) => sum + (txn.weightMT || 0), 0);
    console.log(`Total WeightMT for ${region}: ${totalWeight}`);
    
    // Check for any hardcoded amount in wallet_history that might be throwing off Sambhajinagar
    if (region === 'Sambhajinagar') {
        const allRegionTxns = (await getDocs(collection(db, "wallet_history"))).docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((txn: any) => {
                const dealer = dealers.find((d: any) => d.id === txn.dealerId || d.firmName === txn.dealerName);
                return txn.region === region || dealer?.region === region;
            });
        console.log(`All transactions for Sambhajinagar:`, allRegionTxns);
    }
  }
}

auditData().catch(console.error);
