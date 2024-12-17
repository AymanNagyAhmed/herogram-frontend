import type { Metadata } from 'next'
import { AuthProvider } from '@/context/auth.context'
import '@/globals.css'
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Login | Your App Name',
  description: 'Secure login to access your account',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
