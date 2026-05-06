import type { Transaction, TransactionType, TransactionDirection } from "@/data/contractor/mockTransactions";

export const generateTransaction = (
  type: TransactionType,
  source: string,
  amount: number,
  direction: TransactionDirection,
  metadata: { couponId?: string; pumpId?: string } = {}
): Transaction => {
  const timestamp = new Date().getTime();
  const dateStr = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    transactionId: `TXN-${timestamp.toString().slice(-6)}`,
    type,
    source,
    amount,
    direction,
    status: "Success",
    createdAt: dateStr,
    ...metadata
  };
};
