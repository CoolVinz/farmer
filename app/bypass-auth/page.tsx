'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function BypassAuthPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleBypassLogin = () => {
    // Store bypass auth state in localStorage
    localStorage.setItem('bypass-auth', 'true')
    setIsLoggedIn(true)
  }

  const handleClearBypass = () => {
    localStorage.removeItem('bypass-auth')
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🚀 ทดสอบระบบ</CardTitle>
          <p className="text-muted-foreground">
            Bypass Authentication for Development
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoggedIn ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ โหมดการพัฒนา</h3>
                <p className="text-sm text-yellow-700">
                  ใช้สำหรับทดสอบระบบโดยไม่ต้องเข้าสู่ระบบ (เฉพาะการพัฒนาเท่านั้น)
                </p>
              </div>

              <Button 
                onClick={handleBypassLogin}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                🔓 เข้าสู่ระบบแบบทดสอบ
              </Button>

              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth">
                    🔐 เข้าสู่ระบบปกติ
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/report-test">
                    📊 ดูรายงานทดสอบ
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-green-800 mb-2">✅ พร้อมใช้งาน</h3>
                <p className="text-sm text-green-700">
                  คุณสามารถเข้าใช้งานระบบได้แล้ว
                </p>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/">
                    🏠 ไปหน้าหลัก
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/report">
                    📊 ดูรายงาน
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/logs">
                    📝 จัดการบันทึก
                  </Link>
                </Button>
              </div>

              <Button 
                onClick={handleClearBypass}
                variant="destructive" 
                className="w-full"
              >
                🚪 ออกจากระบบ
              </Button>
            </>
          )}
          
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Development Mode Only - Not for Production
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}