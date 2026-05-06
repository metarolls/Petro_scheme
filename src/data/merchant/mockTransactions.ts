export interface MerchantTransaction {
  transactionId: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  status: "Success" | "Pending" | "Failed";
  paymentMethod: "Wallet";
  createdAt: string;
}

export const mockMerchantTransactions: MerchantTransaction[] = [
  {
    transactionId: "TXN-101",
    contractorId: "CON-001",
    contractorName: "Rahul Patil",
    amount: 1500,
    status: "Success",
    paymentMethod: "Wallet",
    createdAt: "2026-05-06 10:05 AM"
  },
  {
    transactionId: "TXN-102",
    contractorId: "CON-002",
    contractorName: "Suresh Jadhav",
    amount: 800,
    status: "Success",
    paymentMethod: "Wallet",
    createdAt: "2026-05-06 10:22 AM"
  },
  {
    transactionId: "TXN-103",
    contractorId: "CON-003",
    contractorName: "Amit Shinde",
    amount: 2200,
    status: "Success",
    paymentMethod: "Wallet",
    createdAt: "2026-05-06 11:10 AM"
  }
];
