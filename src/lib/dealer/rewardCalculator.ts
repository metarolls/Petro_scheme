export const calculateReward = (weightKg: number): number => {
  return weightKg * 2;
};

export const kgToMt = (kg: number): number => {
  return kg / 1000;
};

export const mtToKg = (mt: number): number => {
  return mt * 1000;
};
