export interface Contractor {
  contractorId: string;
  name: string;
  phone: string;
  walletBalance: number;
  pin: string;
}

export const mockContractor: Contractor = {
  contractorId: "CON-001",
  name: "Ramesh Patil",
  phone: "9876543210",
  walletBalance: 3450,
  pin: "1234"
};
