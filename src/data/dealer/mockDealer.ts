export interface Dealer {
  dealerId: string;
  name: string;
  phone: string;
  availableStockMT: number;
}

export const mockDealer: Dealer = {
  dealerId: "DLR-001",
  name: "Shree Steel Traders",
  phone: "9876543210",
  availableStockMT: 12.5
};
