'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { RegisterHeader } from '@/components/auth/RegisterHeader'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">      
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg">
          <RegisterHeader />
          <RegisterForm />
        </div>
      </main>
    </div>
  )
} 