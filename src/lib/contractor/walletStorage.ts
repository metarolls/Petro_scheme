import { mockContractor } from "@/data/contractor/mockContractor";
import { mockTransactions } from "@/data/contractor/mockTransactions";
import type { Transaction } from "@/data/contractor/mockTransactions";

const STORAGE_KEYS = {
  BALANCE: 'contractor_balance',
  TRANSACTIONS: 'contractor_transactions',
  SCANNED_COUPONS: 'contractor_scanned_coupons'
};

export const getWalletBalance = (): number => {
  const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
  return saved ? parseFloat(saved) : mockContractor.walletBalance;
};

export const setWalletBalance = (amount: number) => {
  localStorage.setItem(STORAGE_KEYS.BALANCE, amount.toString());
};

export const getTransactions = (): Transaction[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return saved ? JSON.parse(saved) : mockTransactions;
};

export const addTransaction = (transaction: Transaction) => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
};

export const isCouponScanned = (couponId: string): boolean => {
  const saved = localStorage.getItem(STORAGE_KEYS.SCANNED_COUPONS);
  const scanned = saved ? JSON.parse(saved) : [];
  return scanned.includes(couponId);
};

export const markCouponAsScanned = (couponId: string) => {
  const saved = localStorage.getItem(STORAGE_KEYS.SCANNED_COUPONS);
  const scanned = saved ? JSON.parse(saved) : [];
  if (!scanned.includes(couponId)) {
    scanned.push(couponId);
    localStorage.setItem(STORAGE_KEYS.SCANNED_COUPONS, JSON.stringify(scanned));
  }
};
