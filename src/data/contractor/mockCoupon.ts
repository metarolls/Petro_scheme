export interface Coupon {
  couponId: string;
  dealerId: string;
  weightKg: number;
  rewardValue: number;
  generatedAt: string;
}

export const mockCoupon: Coupon = {
  couponId: "CPN-TEST-123",
  dealerId: "DLR-001",
  weightKg: 50,
  rewardValue: 250,
  generatedAt: new Date().toISOString()
};
