import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
}

export function formatDimensions(dimensions?: string): string {
  if (!dimensions) return 'Unknown size';
  return dimensions;
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'analyzing':
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'complete':
    case 'listed':
    case 'excellent':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'error':
    case 'failed':
    case 'poor':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getImageUrl(url: string): string {
  // Handle base64 URLs and external URLs
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url;
  }
  // Handle relative URLs
  return url.startsWith('/') ? url : `/${url}`;
}
