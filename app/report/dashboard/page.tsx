'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AgriTrackSidebar } from '@/components/AgriTrackSidebar'
import { TreeRepository } from '@/lib/repositories/tree.repository'
import { TreeLogRepository } from '@/lib/repositories/tree-log.repository'
import { TreeCostRepository } from '@/lib/repositories/tree-cost.repository'

interface FinancialData {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  monthlyTrend: { month: string; income: number; expenses: number }[]
  expenseCategories: { category: string; amount: number; percentage: number }[]
}

export default function DashboardPage() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyTrend: [],
    expenseCategories: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchFinancialData()
  }, [])

  async function fetchFinancialData() {
    try {
      const treeRepo = new TreeRepository()
      const treeLogRepo = new TreeLogRepository()
      const treeCostRepo = new TreeCostRepository()

      // Fetch data in parallel
      const [
        yieldData,
        monthlyRevenue,
        costDistribution,
        monthlyTrend
      ] = await Promise.allSettled([
        treeRepo.getMonthlyYieldData(),
        treeCostRepo.getMonthlyRevenue(),
        treeCostRepo.getCostDistribution(),
        treeCostRepo.getMonthlyTrend()
      ])

      // Calculate total income from yield data (estimated market prices)
      const totalYield = yieldData.status === 'fulfilled' 
        ? yieldData.value.reduce((total, tree) => {
            const fruitCount = tree.fruitCount || 0
            const weightPerFruit = getWeightPerFruit(tree.variety)
            const pricePerKg = getPricePerKg(tree.variety)
            return total + (fruitCount * weightPerFruit * pricePerKg)
          }, 0)
        : 0

      const totalExpenses = monthlyRevenue.status === 'fulfilled' ? Number(monthlyRevenue.value) : 0
      const expenses = costDistribution.status === 'fulfilled' ? costDistribution.value : []
      const trend = monthlyTrend.status === 'fulfilled' ? monthlyTrend.value : []

      // Calculate expense categories with percentages
      const totalExpenseAmount = expenses.reduce((sum, exp) => sum + Number(exp.totalAmount), 0)
      const expenseCategories = expenses.map(exp => ({
        category: exp.activityType,
        amount: Number(exp.totalAmount),
        percentage: totalExpenseAmount > 0 ? (Number(exp.totalAmount) / totalExpenseAmount) * 100 : 0
      }))

      // Transform monthly trend data
      const monthlyTrendData = trend.slice(-6).map(item => ({
        month: item.month,
        income: totalYield / 6, // Distribute income across months
        expenses: Number(item.amount)
      }))

      setFinancialData({
        totalIncome: totalYield,
        totalExpenses,
        netProfit: totalYield - totalExpenses,
        monthlyTrend: monthlyTrendData,
        expenseCategories
      })
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for pricing
  function getWeightPerFruit(variety: string | null): number {
    const varietyWeights: Record<string, number> = {
      'หมอนทอง': 2.5,
      'ชะนี': 3.0,
      'กันยาว': 2.8,
      'กระดุม': 1.5,
      'ไผ่ทอง': 2.2
    }
    return varietyWeights[variety || ''] || 2.5
  }

  function getPricePerKg(variety: string | null): number {
    const varietyPrices: Record<string, number> = {
      'หมอนทอง': 180,
      'ชะนี': 200,
      'กันยาว': 190,
      'กระดุม': 160,
      'ไผ่ทอง': 175
    }
    return varietyPrices[variety || ''] || 180
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('th-TH').format(Math.round(amount))
  }

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
        <style jsx>{`
          :root {
            --primary-color: #53d22c;
            --secondary-color: #ebf2e9;
            --text-primary: #121a0f;
            --text-secondary: #639155;
            --border-color: #d6e5d2;
          }
          .icon-primary { color: var(--text-primary); }
          .icon-secondary { color: var(--text-secondary); }
          .icon-active { color: var(--primary-color); }
          .bg-primary-light { background-color: var(--secondary-color); }
          .border-primary-custom { border-color: var(--primary-color); }
          .text-primary-custom { color: var(--primary-color); }
        `}</style>
        
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-start py-5">
            <AgriTrackSidebar />
            
            <main className="layout-content-container flex flex-col flex-1 px-4">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                  <p className="text-[var(--text-secondary)]">กำลังโหลดข้อมูลทางการเงิน...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <style jsx>{`
        :root {
          --primary-color: #53d22c;
          --secondary-color: #ebf2e9;
          --text-primary: #121a0f;
          --text-secondary: #639155;
          --border-color: #d6e5d2;
        }
        .icon-primary { color: var(--text-primary); }
        .icon-secondary { color: var(--text-secondary); }
        .icon-active { color: var(--primary-color); }
        .bg-primary-light { background-color: var(--secondary-color); }
        .border-primary-custom { border-color: var(--primary-color); }
        .text-primary-custom { color: var(--primary-color); }
      `}</style>
      
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-start py-5">
          <AgriTrackSidebar />
          
          <main className="layout-content-container flex flex-col flex-1 px-4">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-[var(--border-color)]">
              <p className="text-[var(--text-primary)] tracking-tight text-[32px] font-bold leading-tight min-w-72">Finance</p>
              <Link href="/logs/cost">
                <button className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200">
                  Add Transaction
                </button>
              </Link>
            </header>

            {/* Tab Navigation */}
            <div className="pb-3">
              <div className="flex border-b border-[var(--border-color)] px-4 gap-8">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex flex-col items-center justify-center border-b-[3px] ${
                    activeTab === 'overview' 
                      ? 'border-primary-custom text-[var(--text-primary)]' 
                      : 'border-b-transparent text-[var(--text-secondary)] hover:border-primary-custom hover:text-[var(--text-primary)]'
                  } pb-[13px] pt-4 transition-colors duration-200`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Overview</p>
                </button>
                
                <Link 
                  href="/report"
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[var(--text-secondary)] pb-[13px] pt-4 hover:border-primary-custom hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Transactions</p>
                </Link>
                
                <Link 
                  href="/report"
                  className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[var(--text-secondary)] pb-[13px] pt-4 hover:border-primary-custom hover:text-[var(--text-primary)] transition-colors duration-200"
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Reports</p>
                </Link>
              </div>
            </div>

            {/* Financial Summary */}
            <section className="p-4">
              <h2 className="text-[var(--text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Financial Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm">
                  <p className="text-[var(--text-primary)] text-base font-medium leading-normal">Total Income</p>
                  <p className="text-[var(--text-primary)] tracking-light text-3xl font-bold leading-tight">
                    ฿{formatCurrency(financialData.totalIncome)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm">
                  <p className="text-[var(--text-primary)] text-base font-medium leading-normal">Total Expenses</p>
                  <p className="text-[var(--text-primary)] tracking-light text-3xl font-bold leading-tight">
                    ฿{formatCurrency(financialData.totalExpenses)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm">
                  <p className="text-[var(--text-primary)] text-base font-medium leading-normal">Net Profit</p>
                  <p className="text-[var(--primary-color)] tracking-light text-3xl font-bold leading-tight">
                    ฿{formatCurrency(financialData.netProfit)}
                  </p>
                </div>
              </div>
            </section>

            {/* Income vs Expenses Chart */}
            <section className="p-4">
              <h2 className="text-[var(--text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Income vs. Expenses</h2>
              <div className="rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm">
                <p className="text-[var(--text-primary)] text-lg font-semibold leading-normal mb-4">Monthly Breakdown</p>
                <div className="grid min-h-[220px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                  {financialData.monthlyTrend.map((trend, index) => {
                    const maxAmount = Math.max(
                      ...financialData.monthlyTrend.map(t => Math.max(t.income, t.expenses))
                    )
                    const incomeHeight = maxAmount > 0 ? (trend.income / maxAmount) * 80 + 20 : 20
                    const expenseHeight = maxAmount > 0 ? (trend.expenses / maxAmount) * 80 + 20 : 20
                    
                    return (
                      <React.Fragment key={trend.month}>
                        <div className="relative w-full h-full flex items-end">
                          <div 
                            className="absolute bottom-0 w-full bg-[var(--secondary-color)] rounded-t-md" 
                            style={{height: `${incomeHeight}%`}}
                            title={`Income: ฿${formatCurrency(trend.income)}`}
                          ></div>
                          <div 
                            className="absolute bottom-0 w-full bg-[var(--primary-color)] rounded-t-md opacity-70" 
                            style={{height: `${expenseHeight}%`}}
                            title={`Expenses: ฿${formatCurrency(trend.expenses)}`}
                          ></div>
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs font-medium leading-normal tracking-[0.015em]">
                          {new Date(trend.month + '-01').toLocaleDateString('th-TH', { month: 'short' })}
                        </p>
                      </React.Fragment>
                    )
                  })}
                  {financialData.monthlyTrend.length === 0 && (
                    <>
                      <div className="relative w-full h-full flex items-end">
                        <div className="absolute bottom-0 w-full bg-gray-200 rounded-t-md" style={{height: '20%'}}></div>
                      </div>
                      <p className="text-[var(--text-secondary)] text-xs font-medium leading-normal tracking-[0.015em]">No Data</p>
                    </>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[var(--secondary-color)] rounded-sm"></div>
                    <span className="text-xs text-[var(--text-secondary)]">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[var(--primary-color)] opacity-70 rounded-sm"></div>
                    <span className="text-xs text-[var(--text-secondary)]">Expenses</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Expense Categories */}
            <section className="p-4">
              <h2 className="text-[var(--text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Expense Categories</h2>
              <div className="rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm">
                <p className="text-[var(--text-primary)] text-lg font-semibold leading-normal mb-6">Breakdown by Category</p>
                <div className="space-y-5">
                  {financialData.expenseCategories.map((category, index) => (
                    <div key={category.category} className="grid grid-cols-[120px_1fr_auto] items-center gap-x-4">
                      <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">
                        {category.category}
                      </p>
                      <div className="h-3 bg-[var(--secondary-color)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--primary-color)] rounded-full" 
                          style={{width: `${category.percentage}%`}}
                        ></div>
                      </div>
                      <p className="text-[var(--text-primary)] text-sm font-semibold">
                        ฿{formatCurrency(category.amount)}
                      </p>
                    </div>
                  ))}
                  {financialData.expenseCategories.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">ไม่มีข้อมูลค่าใช้จ่าย</p>
                      <Link href="/logs/cost">
                        <button className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200">
                          เพิ่มข้อมูลค่าใช้จ่าย
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}