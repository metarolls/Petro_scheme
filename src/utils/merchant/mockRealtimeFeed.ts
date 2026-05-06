import { type MerchantTransaction, mockMerchantTransactions } from "@/data/merchant/mockTransactions";

const STORAGE_KEY = 'merchant_live_transactions';

export const getLiveTransactions = (): MerchantTransaction[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : mockMerchantTransactions;
};

export const saveTransactions = (txns: MerchantTransaction[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
};

const contractorNames = ["Rahul Patil", "Suresh Jadhav", "Amit Shinde", "Vijay Deshmukh", "Ganesh Mane"];

export const generateNewMockPayment = (): MerchantTransaction => {
  const timestamp = new Date();
  const dateStr = timestamp.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    transactionId: `TXN-${Math.floor(Math.random() * 100000)}`,
    contractorId: `CON-${Math.floor(Math.random() * 1000)}`,
    contractorName: contractorNames[Math.floor(Math.random() * contractorNames.length)],
    amount: Math.floor(Math.random() * 2500) + 500,
    status: "Success",
    paymentMethod: "Wallet",
    createdAt: dateStr
  };
};
