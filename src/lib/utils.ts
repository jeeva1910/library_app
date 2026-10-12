import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Reusable Fine Calculation Logic
 * Calculates fine based on overdue days and fine per day rate ($2.00/day default)
 */
export function calculateFine(
  dueDateStr: string,
  returnDateStr: string = new Date().toISOString(),
  finePerDay: number = 2.0
): { overdueDays: number; fineAmount: number } {
  const dueDate = new Date(dueDateStr);
  const returnDate = new Date(returnDateStr);

  // Strip time component for clean day comparison
  dueDate.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  const diffTime = returnDate.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      overdueDays: diffDays,
      fineAmount: Number((diffDays * finePerDay).toFixed(2)),
    };
  }

  return { overdueDays: 0, fineAmount: 0 };
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function isOverdue(dueDateStr: string, status: string): boolean {
  if (status === 'returned') return false;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return today > dueDate;
}

export function getDaysRemaining(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = dueDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
