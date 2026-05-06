export interface MerchantPump {
  pumpId: string;
  pumpName: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  outstandingBalance: number;
}

export const mockMerchantPump: MerchantPump = {
  pumpId: "PUMP-001",
  pumpName: "Sai Petrol Pump",
  location: "Pune Highway",
  ownerName: "Mahesh Jadhav",
  ownerPhone: "9876500000",
  outstandingBalance: 18750
};
