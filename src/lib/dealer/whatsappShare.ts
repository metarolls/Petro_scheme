import type { Coupon } from "@/types/coupon";

export const getWhatsAppShareUrl = (coupon: Coupon): string => {
  const message = `TMT Coupon Generated
Coupon ID: ${coupon.couponId}
Weight: ${coupon.weightKg} Kg
Reward Value: ₹${coupon.rewardValue}
Please scan the QR code.`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};
