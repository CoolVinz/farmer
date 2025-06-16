'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'farm-worker'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, loading, isHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isHydrated) {
      if (!user) {
        router.push('/auth')
        return
      }

      if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
        router.push('/')
        return
      }
    }
  }, [user, userRole, loading, isHydrated, router, requiredRole])

  if (loading || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}