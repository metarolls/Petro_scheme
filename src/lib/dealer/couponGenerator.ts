import type { Coupon } from "@/types/coupon";
import { calculateReward, kgToMt } from "./rewardCalculator";

export const generateCoupon = (dealerId: string, weightKg: number): Coupon => {
  const timestamp = new Date().getTime();
  
  return {
    couponId: `CP-${timestamp.toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
    dealerId,
    weightKg,
    weightMT: kgToMt(weightKg),
    rewardValue: calculateReward(weightKg),
    status: "Active"
  };
};
