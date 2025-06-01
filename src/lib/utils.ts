import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to calculate working days (Mon-Fri) between two dates, inclusive
export function calculateWorkingDays(startDate: string, endDate: string): number {
  let count = 0
  const currentDate = new Date(startDate)
  const lastDate = new Date(endDate)

  // Ensure startDate is not after endDate
  if (currentDate > lastDate) {
    return 0
  }

  while (currentDate <= lastDate) {
    const dayOfWeek = currentDate.getDay() // 0 (Sunday) to 6 (Saturday)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Monday to Friday
      count++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return count
}
