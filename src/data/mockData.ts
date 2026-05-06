export interface Dealer {
  id: string;
  name: string;
  phone: string;
  location: string;
  stockMT: number;
  status: 'Active' | 'Inactive';
}

export interface PetrolPump {
  id: string;
  name: string;
  location: string;
  ownerName: string;
  ownerPhone: string;
  pendingAmount: number;
  qrCode: string;
  status: 'Active' | 'Inactive';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Stock Allocation' | 'Fuel Payout' | 'Settlement';
  dealer?: string;
  contractor?: string;
  petrolPump?: string;
  tmtMT?: number;
  amount: number;
  status: 'Completed' | 'Pending' | 'Paid';
}

export interface Settlement {
  id: string;
  pumpName: string;
  location: string;
  ownerPhone: string;
  pendingAmount: number;
  lastPaymentDate: string;
  status: 'Pending' | 'Paid';
}

export const dealers: Dealer[] = [
  { id: 'DLR-001', name: 'Jai Maharashtra Traders', phone: '9876543210', location: 'Pune', stockMT: 1250, status: 'Active' },
  { id: 'DLR-002', name: 'Swaraj Enterprises', phone: '9876543211', location: 'Mumbai', stockMT: 850, status: 'Active' },
  { id: 'DLR-003', name: 'Om Sai Steels', phone: '9876543212', location: 'Nashik', stockMT: 450, status: 'Active' },
  { id: 'DLR-004', name: 'Vidarbha Metals', phone: '9876543213', location: 'Nagpur', stockMT: 2100, status: 'Active' },
  { id: 'DLR-005', name: 'Khandesh Traders', phone: '9876543214', location: 'Jalgaon', stockMT: 320, status: 'Inactive' },
];

export const petrolPumps: PetrolPump[] = [
  { id: 'PMP-001', name: 'Bharat Petroleum Kothrud', location: 'Pune', ownerName: 'Rajesh Patil', ownerPhone: '9012345670', pendingAmount: 45000, qrCode: 'QR_PMP_001', status: 'Active' },
  { id: 'PMP-002', name: 'HP Pump Hinjewadi', location: 'Pune', ownerName: 'Sanjay Deshmukh', ownerPhone: '9012345671', pendingAmount: 12000, qrCode: 'QR_PMP_002', status: 'Active' },
  { id: 'PMP-003', name: 'Indian Oil Wakad', location: 'Pune', ownerName: 'Vijay More', ownerPhone: '9012345672', pendingAmount: 0, qrCode: 'QR_PMP_003', status: 'Active' },
  { id: 'PMP-004', name: 'Reliance Fuel Station', location: 'Nagpur', ownerName: 'Anil Gupta', ownerPhone: '9012345673', pendingAmount: 85000, qrCode: 'QR_PMP_004', status: 'Active' },
];

export const settlements: Settlement[] = [
  { id: 'STL-001', pumpName: 'Bharat Petroleum Kothrud', location: 'Pune', ownerPhone: '9012345670', pendingAmount: 45000, lastPaymentDate: '2024-04-15', status: 'Pending' },
  { id: 'STL-002', pumpName: 'HP Pump Hinjewadi', location: 'Pune', ownerPhone: '9012345671', pendingAmount: 12000, lastPaymentDate: '2024-04-10', status: 'Pending' },
  { id: 'STL-003', pumpName: 'Reliance Fuel Station', location: 'Nagpur', ownerPhone: '9012345673', pendingAmount: 85000, lastPaymentDate: '2024-03-28', status: 'Pending' },
];

export const transactions: Transaction[] = [
  { id: 'TXN-1001', date: '2024-05-01', type: 'Stock Allocation', dealer: 'Jai Maharashtra Traders', tmtMT: 50, amount: 0, status: 'Completed' },
  { id: 'TXN-1002', date: '2024-05-02', type: 'Fuel Payout', contractor: 'Aman Construction', petrolPump: 'Bharat Petroleum Kothrud', amount: 15000, status: 'Paid' },
  { id: 'TXN-1003', date: '2024-05-03', type: 'Settlement', petrolPump: 'HP Pump Hinjewadi', amount: 25000, status: 'Completed' },
  { id: 'TXN-1004', date: '2024-05-04', type: 'Fuel Payout', contractor: 'Shiv Shakti Buildcon', petrolPump: 'Indian Oil Wakad', amount: 8000, status: 'Paid' },
  { id: 'TXN-1005', date: '2024-05-05', type: 'Stock Allocation', dealer: 'Swaraj Enterprises', tmtMT: 120, amount: 0, status: 'Completed' },
];

export const dashboardStats = {
  activeDealers: 48,
  totalContractors: 320,
  totalTmtDistributed: 12450,
  totalFuelPayouts: 1875000,
};

export const salesChartData = [
  { day: 'Mon', tmt: 1200 },
  { day: 'Tue', tmt: 1800 },
  { day: 'Wed', tmt: 1500 },
  { day: 'Thu', tmt: 2100 },
  { day: 'Fri', tmt: 1900 },
  { day: 'Sat', tmt: 2400 },
  { day: 'Sun', tmt: 1600 },
];
