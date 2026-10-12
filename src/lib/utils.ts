import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} FCFA`;
}

export function calculateDaysRemaining(expiryDateIso: string): {
  days: number;
  hours: number;
  isExpired: boolean;
  percentage: number;
} {
  const now = Date.now();
  const expiry = new Date(expiryDateIso).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, isExpired: true, percentage: 0 };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Supposons une durée nominale de 30 jours pour la jauge
  const totalDurationMs = 30 * 24 * 60 * 60 * 1000;
  const percentage = Math.min(100, Math.max(0, Math.round((diffMs / totalDurationMs) * 100)));

  return {
    days,
    hours,
    isExpired: false,
    percentage
  };
}
