export type TransactionType = "Reward Earned" | "Fuel Payment" | "Admin Adjustment";
export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "Success" | "Failed" | "Pending";

export interface Transaction {
  transactionId: string;
  type: TransactionType;
  source: string;
  couponId?: string;
  pumpId?: string;
  amount: number;
  direction: TransactionDirection;
  status: TransactionStatus;
  createdAt: string;
}

export const mockTransactions: Transaction[] = [
  {
    transactionId: "TXN-001",
    type: "Reward Earned",
    source: "Dealer Coupon",
    couponId: "CP-001",
    amount: 400,
    direction: "credit",
    status: "Success",
    createdAt: "2026-05-06 10:15 AM"
  },
  {
    transactionId: "TXN-002",
    type: "Fuel Payment",
    source: "Sai Petrol Pump",
    pumpId: "PUMP-001",
    amount: 800,
    direction: "debit",
    status: "Success",
    createdAt: "2026-05-06 12:30 PM"
  }
];
