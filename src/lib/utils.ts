import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function comingSoon(feature?: string) {
  toast.info(feature ? `${feature} is coming soon!` : "This feature is coming soon!", {
    description: "We're working hard to bring this to you.",
    icon: "🚀"
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
}

export function formatFirestoreDate(timestamp: any) {
  if (!timestamp) return '---';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return '---';
  }
}
