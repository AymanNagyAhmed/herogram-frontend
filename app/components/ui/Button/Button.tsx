'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  children,
  isLoading,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  type = 'button',
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
})

Button.displayName = 'Button'

export { Button } 