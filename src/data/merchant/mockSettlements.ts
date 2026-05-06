export interface MerchantSettlement {
  settlementId: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending";
}

export const mockMerchantSettlements: MerchantSettlement[] = [
  {
    settlementId: "SET-001",
    date: "2026-05-05",
    amount: 12000,
    status: "Paid"
  },
  {
    settlementId: "SET-002",
    date: "2026-05-06",
    amount: 18750,
    status: "Pending"
  }
];
