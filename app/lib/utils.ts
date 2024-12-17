import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}) {
  return new Date(date).toLocaleDateString('en-US', options)
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if running on client side
 */
export const isClient = typeof window !== 'undefined'

/**
 * Check if running on server side
 */
export const isServer = typeof window === 'undefined'

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text
}

/**
 * Generate random string
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Remove undefined and null values from object
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof T] = value
    }
    return acc
  }, {} as Partial<T>)
} 