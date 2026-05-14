
import { db } from '../src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function auditTransactions() {
  const txnsSnap = await getDocs(collection(db, "transactions"));
  const summary: Record<string, number> = {};
  
  txnsSnap.forEach(doc => {
    const data = doc.data();
    const region = data.region || 'Unknown';
    const volume = data.tmtMT || 0;
    const type = data.type;
    
    if (type === 'Stock Allocation') {
      summary[region] = (summary[region] || 0) + volume;
    }
    
    console.log(`ID: ${doc.id} | Region: ${region} | Type: ${type} | Volume: ${volume} | Date: ${data.date}`);
  });
  
  console.log("\nSummary of Stock Allocation by Region:");
  console.log(JSON.stringify(summary, null, 2));
}

auditTransactions().catch(console.error);
