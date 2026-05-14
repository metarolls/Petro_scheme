export interface Dealer {
  id: string;
  name: string;
  phone: string;
  location: string;
  stockMT: number;
  status: 'Active' | 'Inactive';
  marketingOfficer?: string;
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
  type: 'Stock Allocation' | 'Fuel Payout' | 'Settlement' | 'Reward Transfer';
  dealer?: string;
  contractor?: string;
  petrolPump?: string;
  tmtMT?: number;
  amount: number;
  status: 'Completed' | 'Pending' | 'Paid';
  region?: string;
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
  { id: 'DLR-001', name: 'Jai Maharashtra Traders', phone: '9876543210', location: 'Nashik', stockMT: 1250, status: 'Active', marketingOfficer: 'Manoj Junnare' },
  { id: 'DLR-002', name: 'Swaraj Enterprises', phone: '9876543211', location: 'Jalgaon', stockMT: 850, status: 'Active', marketingOfficer: 'Premvardhan Marathe' },
  { id: 'DLR-003', name: 'Om Sai Steels', phone: '9876543212', location: 'Sambhajinagar', stockMT: 450, status: 'Active', marketingOfficer: 'Vandan Yelmame' },
  { id: 'DLR-004', name: 'Vidarbha Metals', phone: '9876543213', location: 'Jalna', stockMT: 2100, status: 'Active', marketingOfficer: 'Vinod Kirange' },
  { id: 'DLR-005', name: 'Khandesh Traders', phone: '9876543214', location: 'Ahmednagar', stockMT: 320, status: 'Inactive', marketingOfficer: 'Rohit Geete' },
  { id: 'DLR-006', name: 'Solapur Steels', phone: '9876543215', location: 'Solapur', stockMT: 600, status: 'Active', marketingOfficer: 'Nitin Khente' },
  { id: 'DLR-007', name: 'Akluj Traders', phone: '9876543216', location: 'Akluj', stockMT: 150, status: 'Active', marketingOfficer: 'Sushil Tiramale' },
  { id: 'DLR-008', name: 'Jalna Steel Hub', phone: '9876543217', location: 'Jalna', stockMT: 1800, status: 'Active', marketingOfficer: 'Vinod Kirange' },
  { id: 'DLR-009', name: 'Nagar Enterprise', phone: '9876543218', location: 'Ahmednagar', stockMT: 950, status: 'Active', marketingOfficer: 'Rohit Geete' },
];

export const petrolPumps: PetrolPump[] = [
  { id: 'PMP-001', name: 'Bharat Petroleum Kothrud', location: 'Nashik', ownerName: 'Rajesh Patil', ownerPhone: '9012345670', pendingAmount: 45000, qrCode: 'QR_PMP_001', status: 'Active' },
  { id: 'PMP-002', name: 'HP Pump Hinjewadi', location: 'Sambhajinagar', ownerName: 'Sanjay Deshmukh', ownerPhone: '9012345671', pendingAmount: 12000, qrCode: 'QR_PMP_002', status: 'Active' },
  { id: 'PMP-003', name: 'Indian Oil Wakad', location: 'Akluj', ownerName: 'Vijay More', ownerPhone: '9012345672', pendingAmount: 0, qrCode: 'QR_PMP_003', status: 'Active' },
  { id: 'PMP-004', name: 'Reliance Fuel Station', location: 'Solapur', ownerName: 'Anil Gupta', ownerPhone: '9012345673', pendingAmount: 85000, qrCode: 'QR_PMP_004', status: 'Active' },
  { id: 'PMP-005', name: 'Jalna City Fuel', location: 'Jalna', ownerName: 'Kiran Shah', ownerPhone: '9012345674', pendingAmount: 32000, qrCode: 'QR_PMP_005', status: 'Active' },
];

export const settlements: Settlement[] = [
  { id: 'STL-001', pumpName: 'Bharat Petroleum Kothrud', location: 'Nashik', ownerPhone: '9012345670', pendingAmount: 45000, lastPaymentDate: '2024-04-15', status: 'Pending' },
  { id: 'STL-002', pumpName: 'HP Pump Hinjewadi', location: 'Sambhajinagar', ownerPhone: '9012345671', pendingAmount: 12000, lastPaymentDate: '2024-04-10', status: 'Pending' },
  { id: 'STL-003', pumpName: 'Reliance Fuel Station', location: 'Solapur', ownerPhone: '9012345673', pendingAmount: 85000, lastPaymentDate: '2024-03-28', status: 'Pending' },
];

export const transactions: Transaction[] = [
  { id: 'TXN-1001', date: '2026-05-12', type: 'Stock Allocation', dealer: 'Jai Maharashtra Traders', tmtMT: 50, amount: 10000, status: 'Completed', region: 'Nashik' },
  { id: 'TXN-1002', date: '2026-05-11', type: 'Fuel Payout', contractor: 'Aman Construction', petrolPump: 'Bharat Petroleum Kothrud', amount: 15000, status: 'Paid', region: 'Nashik' },
  { id: 'TXN-1003', date: '2026-05-10', type: 'Settlement', petrolPump: 'HP Pump Hinjewadi', amount: 25000, status: 'Completed', region: 'Sambhajinagar' },
  { id: 'TXN-1004', date: '2026-05-09', type: 'Fuel Payout', contractor: 'Shiv Shakti Buildcon', petrolPump: 'Indian Oil Wakad', amount: 8000, status: 'Paid', region: 'Akluj' },
  { id: 'TXN-1005', date: '2026-05-12', type: 'Stock Allocation', dealer: 'Swaraj Enterprises', tmtMT: 120, amount: 24000, status: 'Completed', region: 'Jalgaon' },
  { id: 'TXN-1006', date: '2026-05-13', type: 'Stock Allocation', dealer: 'Solapur Steels', tmtMT: 85, amount: 17000, status: 'Completed', region: 'Solapur' },
  { id: 'TXN-1007', date: '2026-05-13', type: 'Fuel Payout', contractor: 'Pawar Infra', petrolPump: 'Reliance Fuel Station', amount: 12000, status: 'Paid', region: 'Solapur' },
  { id: 'TXN-1008', date: '2026-05-12', type: 'Reward Transfer', dealer: 'Jai Maharashtra Traders', contractor: 'Aman Construction', amount: 5000, status: 'Completed', region: 'Nashik' },
  { id: 'TXN-1009', date: '2026-05-11', type: 'Stock Allocation', dealer: 'Vidarbha Metals', tmtMT: 200, amount: 40000, status: 'Completed', region: 'Jalna' },
  { id: 'TXN-1010', date: '2026-05-10', type: 'Stock Allocation', dealer: 'Khandesh Traders', tmtMT: 45, amount: 9000, status: 'Pending', region: 'Ahmednagar' },
  { id: 'TXN-1011', date: '2026-05-08', type: 'Fuel Payout', contractor: 'Nitin Infra', petrolPump: 'Reliance Fuel Station', amount: 20000, status: 'Paid', region: 'Solapur' },
  { id: 'TXN-1012', date: '2026-05-07', type: 'Reward Transfer', dealer: 'Om Sai Steels', contractor: 'Vijay Buildcon', amount: 3500, status: 'Completed', region: 'Sambhajinagar' },
  { id: 'TXN-1013', date: '2026-05-13', type: 'Stock Allocation', dealer: 'Jalna Steel Hub', tmtMT: 150, amount: 30000, status: 'Completed', region: 'Jalna' },
  { id: 'TXN-1014', date: '2026-05-12', type: 'Fuel Payout', contractor: 'Maratha Builders', petrolPump: 'Jalna City Fuel', amount: 18000, status: 'Paid', region: 'Jalna' },
  { id: 'TXN-1015', date: '2026-05-11', type: 'Reward Transfer', dealer: 'Vidarbha Metals', contractor: 'Deshmukh Infra', amount: 7500, status: 'Completed', region: 'Jalna' },
  { id: 'TXN-1016', date: '2026-05-13', type: 'Stock Allocation', dealer: 'Nagar Enterprise', tmtMT: 90, amount: 18000, status: 'Completed', region: 'Ahmednagar' },
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
