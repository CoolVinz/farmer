'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CostData {
  id: number;
  cost_date: string;
  activity_type: string;
  target: string;
  amount: number;
  notes: string;
}

export default function DashboardPage() {
  const [costs, setCosts] = useState<CostData[]>([]);
  const [trees, setTrees] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedView, setSelectedView] = useState<'monthly' | 'activity' | 'trend'>('monthly');

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const [costsResult, treesResult, logsResult] = await Promise.allSettled([
        supabase.from("tree_costs").select("*").order('cost_date', { ascending: false }),
        supabase.from("trees").select("*"),
        supabase.from("tree_logs").select("*").order('log_date', { ascending: false }).limit(100)
      ]);

      if (costsResult.status === 'fulfilled') {
        setCosts(costsResult.value.data || []);
      }
      if (treesResult.status === 'fulfilled') {
        setTrees(treesResult.value.data || []);
      }
      if (logsResult.status === 'fulfilled') {
        setLogs(logsResult.value.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCosts = costs.filter((cost) => {
    const costDate = new Date(cost.cost_date);
    const matchStart = startDate ? new Date(startDate) <= costDate : true;
    const matchEnd = endDate ? costDate <= new Date(endDate) : true;
    return matchStart && matchEnd;
  });

  // Calculate statistics
  const totalCost = filteredCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
  const avgMonthlyCost = filteredCosts.length > 0 ? totalCost / Math.max(1, new Set(filteredCosts.map(c => c.cost_date.substring(0, 7))).size) : 0;
  const costEntries = filteredCosts.length;
  const aliveTrees = trees.filter(t => t.status === 'alive').length;
  const costPerTree = aliveTrees > 0 ? totalCost / aliveTrees : 0;

  // Monthly chart data
  const monthlyTotals: { [key: string]: number } = {};
  filteredCosts.forEach((cost) => {
    const date = new Date(cost.cost_date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!monthlyTotals[monthYear]) monthlyTotals[monthYear] = 0;
    monthlyTotals[monthYear] += cost.amount || 0;
  });

  const monthlyLabels = Object.keys(monthlyTotals).sort();
  const monthlyValues = monthlyLabels.map((label) => monthlyTotals[label]);

  // Activity breakdown
  const activityTotals: { [key: string]: number } = {};
  filteredCosts.forEach((cost) => {
    const activity = cost.activity_type || 'อื่นๆ';
    if (!activityTotals[activity]) activityTotals[activity] = 0;
    activityTotals[activity] += cost.amount || 0;
  });

  const activityLabels = Object.keys(activityTotals);
  const activityValues = activityLabels.map(label => activityTotals[label]);

  // Chart configurations
  const monthlyChartData = {
    labels: monthlyLabels.map(label => {
      const [year, month] = label.split('-');
      return `${month}/${year.slice(2)}`;
    }),
    datasets: [
      {
        label: "ค่าใช้จ่าย (บาท)",
        data: monthlyValues,
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const activityChartData = {
    labels: activityLabels,
    datasets: [
      {
        data: activityValues,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const trendChartData = {
    labels: monthlyLabels.map(label => {
      const [year, month] = label.split('-');
      return `${month}/${year.slice(2)}`;
    }),
    datasets: [
      {
        label: "แนวโน้มค่าใช้จ่าย",
        data: monthlyValues,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: selectedView !== 'activity' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('th-TH').format(value) + ' ฿';
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    } : undefined,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูลแดชบอร์ด...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              📊 แดชบอร์ดรายงาน
            </h1>
            <p className="text-xl text-gray-600 mb-8">วิเคราะห์ข้อมูลต้นทุนและการดำเนินงานของสวน</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-indigo-600">{totalCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">ค่าใช้จ่ายรวม (บาท)</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-2xl font-bold text-green-600">{avgMonthlyCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">ค่าใช้จ่ายเฉลี่ย/เดือน</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-purple-600">{costPerTree.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">ต้นทุนต่อต้น (บาท)</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-orange-600">{costEntries}</div>
                  <div className="text-sm text-gray-600">รายการค่าใช้จ่าย</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/logs/cost">
                  💰 เพิ่มค่าใช้จ่าย
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/report">
                  📊 รายงานอื่นๆ
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs">
                  📝 ดูบันทึกทั้งหมด
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">🔍 ตัวกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มต้น
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่สิ้นสุด
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  ผลลัพธ์: {filteredCosts.length} รายการ
                </Badge>
                {startDate && (
                  <Badge variant="secondary">
                    เริ่ม: {new Date(startDate).toLocaleDateString('th-TH')}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant="secondary">
                    สิ้นสุด: {new Date(endDate).toLocaleDateString('th-TH')}
                  </Badge>
                )}
              </div>
              
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart Type Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedView === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('monthly')}
                className={selectedView === 'monthly' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                📊 รายเดือน
              </Button>
              <Button
                variant={selectedView === 'activity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('activity')}
                className={selectedView === 'activity' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                🎯 ตามกิจกรรม
              </Button>
              <Button
                variant={selectedView === 'trend' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('trend')}
                className={selectedView === 'trend' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                📈 แนวโน้ม
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {filteredCosts.length === 0 ? (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">ไม่มีข้อมูลในช่วงเวลาที่เลือก</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                ลองเปลี่ยนช่วงวันที่หรือเพิ่มข้อมูลค่าใช้จ่ายใหม่
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/logs/cost">
                    💰 เพิ่มค่าใช้จ่าย
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  ดูข้อมูลทั้งหมด
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Main Chart */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedView === 'monthly' && '📊 ค่าใช้จ่ายรายเดือน'}
                  {selectedView === 'activity' && '🎯 แบ่งตามกิจกรรม'}
                  {selectedView === 'trend' && '📈 แนวโน้มค่าใช้จ่าย'}
                  <Badge variant="outline" className="ml-auto">
                    {filteredCosts.length} รายการ
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {selectedView === 'monthly' && (
                    <Bar data={monthlyChartData} options={chartOptions} />
                  )}
                  {selectedView === 'activity' && (
                    <Doughnut 
                      data={activityChartData} 
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            position: 'right' as const,
                          },
                        },
                      }} 
                    />
                  )}
                  {selectedView === 'trend' && (
                    <Line data={trendChartData} options={chartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Card>
              <CardHeader>
                <CardTitle>💡 สรุปผล</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ยอดรวมทั้งหมด</span>
                    <span className="font-bold text-lg text-indigo-600">
                      {totalCost.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ค่าเฉลี่ยต่อเดือน</span>
                    <span className="font-semibold text-green-600">
                      {avgMonthlyCost.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ต้นทุนต่อต้น</span>
                    <span className="font-semibold text-purple-600">
                      {costPerTree.toLocaleString()} ฿
                    </span>
                  </div>
                  {activityLabels.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">กิจกรรมหลัก:</p>
                      <p className="text-sm text-gray-600">{activityLabels[0]}</p>
                      <p className="text-lg font-bold text-orange-600">
                        {activityValues[0]?.toLocaleString()} ฿
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>🕒 รายการล่าสุด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCosts.slice(0, 5).map((cost) => (
                    <div key={cost.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium">{cost.activity_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(cost.cost_date).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <span className="font-semibold text-indigo-600">
                        {cost.amount?.toLocaleString()} ฿
                      </span>
                    </div>
                  ))}
                  {filteredCosts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">ไม่มีรายการ</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}