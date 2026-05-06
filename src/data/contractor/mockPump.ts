export interface PetrolPump {
  pumpId: string;
  pumpName: string;
  location: string;
  merchantPhone: string;
}

export const mockPump: PetrolPump = {
  pumpId: "PUMP-001",
  pumpName: "Sai Petrol Pump",
  location: "Pune Highway",
  merchantPhone: "9876500000"
};
