export type CouponStatus = "Active" | "Used" | "Expired";

export interface Coupon {
  couponId: string;
  dealerId: string;
  weightKg: number;
  weightMT: number;
  rewardValue: number;
  generatedAt: string;
  status: CouponStatus;
}

export const mockCoupons: Coupon[] = [
  {
    couponId: "CP-001",
    dealerId: "DLR-001",
    weightKg: 500,
    weightMT: 0.5,
    rewardValue: 1000,
    generatedAt: "2026-05-05 10:30 AM",
    status: "Active"
  },
  {
    couponId: "CP-002",
    dealerId: "DLR-001",
    weightKg: 750,
    weightMT: 0.75,
    rewardValue: 1500,
    generatedAt: "2026-05-04 03:15 PM",
    status: "Used"
  }
];
