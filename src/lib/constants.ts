/**
 * Global business logic constants for Metaroll Rewards
 */

export const REWARD_RATE = 0.20; // ₹ per kg
export const MT_TO_KG = 1000;
export const REWARD_PER_MT = REWARD_RATE * MT_TO_KG; // ₹ per MT

/**
 * Single source of truth for all operational regions.
 *
 * IMPORTANT:
 *  - `value` is stored in Firestore — never rename it after data has been written.
 *  - To change the displayed name, edit `label` / `marathi` only.
 *  - Regional Expansion 2026: Chhatrapati Sambhajinagar, Akluj, Solapur.
 */
export const REGIONS = [
  { value: 'Nashik',        label: 'Nashik',                    marathi: 'नाशिक' },
  { value: 'Jalgaon',       label: 'Jalgaon',                   marathi: 'जळगाव' },
  { value: 'Jalna',         label: 'Jalna',                     marathi: 'जालना' },
  { value: 'Ahmednagar',    label: 'Ahmednagar',                marathi: 'अहमदनगर' },
  { value: 'Sambhajinagar', label: 'Chhatrapati Sambhajinagar', marathi: 'छत्रपती संभाजीनगर' },
  { value: 'Akluj',         label: 'Akluj',                     marathi: 'अकलूज' },
  { value: 'Solapur',       label: 'Solapur',                   marathi: 'सोलापूर' },
] as const;

export type RegionValue = (typeof REGIONS)[number]['value'];

export const MARKETING_OFFICERS = [
  { value: 'Manoj Junnare', label: 'Manoj Junnare', marathi: 'मनोज जुन्नरे' },
  { value: 'Premvardhan Marathe', label: 'Premvardhan Marathe', marathi: 'प्रेमवर्धन मराठे' },
  { value: 'Vandan Yelmame', label: 'Vandan Yelmame', marathi: 'वंदन येलमामे' },
  { value: 'Vinod Kirange', label: 'Vinod Kirange', marathi: 'विनोद किरंगे' },
  { value: 'Rohit Geete', label: 'Rohit Geete', marathi: 'रोहित गीते' },
  { value: 'Nitin Khente', label: 'Nitin Khente', marathi: 'नितिन खेन्ते' },
  { value: 'Sushil Tiramale', label: 'Sushil Tiramale', marathi: 'सुशील तिरमले' },
] as const;

export type MOValue = (typeof MARKETING_OFFICERS)[number]['value'];
