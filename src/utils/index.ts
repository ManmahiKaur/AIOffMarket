import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatting helpers
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatRelativeTime = (isoString: string): string => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const date = new Date(isoString);
  const now = new Date();
  
  const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(Math.round(diffInHours), 'hour');
  }
  
  const diffInDays = diffInHours / 24;
  return rtf.format(Math.round(diffInDays), 'day');
};
