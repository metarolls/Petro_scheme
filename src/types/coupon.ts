export type CouponStatus = "Active" | "Claimed" | "Expired";

export interface Coupon {
  couponId: string;
  dealerId: string;
  weightKg: number;
  weightMT: number;
  rewardValue: number;
  status: CouponStatus;
  generatedAt?: string; // Legacy string format for display
  createdAt?: any;      // Firestore Timestamp
  claimedBy?: string;
  claimedAt?: any;      // Firestore Timestamp
}
