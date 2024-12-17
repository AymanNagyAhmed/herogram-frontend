'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { LoginHeader } from '@/components/auth/LoginHeader'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">      
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg">
          <LoginHeader />
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
