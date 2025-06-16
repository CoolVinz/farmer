'use client'

import { useEffect, useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { BrowserExtensionHandler } from './BrowserExtensionHandler'

interface HydrationSafeLayoutProps {
  children: React.ReactNode
}

export function HydrationSafeLayout({ children }: HydrationSafeLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <BrowserExtensionHandler />
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  )
}