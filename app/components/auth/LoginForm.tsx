'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schema'
import { loginUser, AuthError } from '@/lib/services/auth.service'
import { ZodError } from "zod"
import { Button } from '@/components/ui/Button/Button'
import { FormField } from '@/components/forms/FormField/FormField'
import Link from 'next/link'

export const LoginForm = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginInput>({
    email: 'user3@test.com',
    password: '123456789',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear field-specific error when user starts typing
    if (errors[name as keyof LoginInput]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setErrors({})

    try {
      const validatedData = loginSchema.parse(formData)
      const response = await loginUser(validatedData)
      
      login(response.data.access_token, response.data.user)

      // Check if user has completed registration
      if (response.data.user.fullName) {
        router.push('/user')
      } else {
        router.push('/user/media')
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof LoginInput, string>> = {}
        err.errors.forEach((error) => {
          const [field] = error.path
          fieldErrors[field as keyof LoginInput] = error.message
        })
        setErrors(fieldErrors)
      } else if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6" role="form">
      <div className="space-y-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
          placeholder="Enter your email"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <div 
          className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg text-center" 
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-500">Don't have an account? </span>
          <Link 
            href="/register" 
            className="text-sm font-semibold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 rounded"
            tabIndex={0}
          >
            Register here
          </Link>
        </div>
      </div>
    </form>
  )
} 