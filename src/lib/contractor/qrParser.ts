export interface ScannedCoupon {
  couponId: string;
  dealerId: string;
  weightKg: number;
  rewardValue: number;
  generatedAt: string;
}

export interface ScannedPump {
  pumpId: string;
  pumpName: string;
  location: string;
  merchantPhone: string;
}

export const parseCouponQR = (data: string): ScannedCoupon | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.couponId && parsed.rewardValue) {
      return parsed as ScannedCoupon;
    }
    return null;
  } catch {
    return null;
  }
};

export const parsePumpQR = (data: string): ScannedPump | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.pumpId && parsed.pumpName) {
      return parsed as ScannedPump;
    }
    return null;
  } catch {
    return null;
  }
};
