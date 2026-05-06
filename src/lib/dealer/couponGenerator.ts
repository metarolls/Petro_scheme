import type { Coupon } from "@/data/dealer/mockCoupons";
import { calculateReward, kgToMt } from "./rewardCalculator";

export const generateCoupon = (dealerId: string, weightKg: number): Coupon => {
  const timestamp = new Date().getTime();
  const dateStr = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    couponId: `CP-${timestamp.toString().slice(-6)}`,
    dealerId,
    weightKg,
    weightMT: kgToMt(weightKg),
    rewardValue: calculateReward(weightKg),
    generatedAt: dateStr,
    status: "Active"
  };
};
