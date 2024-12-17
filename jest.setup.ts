import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

// Make jest available globally
global.jest = jest

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '/',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
}) 