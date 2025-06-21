import React from 'react'
import { Navigation } from '@/components/Navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default function HomePage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] text-[#121a0f]">
      <Navigation />
      <DashboardContent />
    </div>
  )
}