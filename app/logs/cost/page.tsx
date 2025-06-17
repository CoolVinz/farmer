'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface ActivityCost {
  id: string;
  name: string;
}

interface CostSummary {
  total: number;
  thisMonth: number;
  entries: number;
}

export default function AddCostLogPage() {
  const [activitiesCost, setActivitiesCost] = useState<ActivityCost[]>([]);
  const [plots, setPlots] = useState<string[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary>({ total: 0, thisMonth: 0, entries: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [activityType, setActivityType] = useState("");
  const [target, setTarget] = useState("ทุกแปลง");
  const [amount, setAmount] = useState<number | "">("");
  const [logDate, setLogDate] = useState("");
  const [notes, setNotes] = useState("");

  // Custom activity
  const [customActivity, setCustomActivity] = useState("");
  const [useCustomActivity, setUseCustomActivity] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Set default date to today
    setLogDate(new Date().toISOString().split("T")[0]);
  }, []);

  async function fetchAllData() {
    try {
      const [activitiesResult, plotsResult, costsResult] = await Promise.allSettled([
        supabase.from("activities_cost").select("*").order("name"),
        supabase.from("trees").select("location_id").order("location_id"),
        supabase.from("tree_costs").select("amount, cost_date").order("cost_date", { ascending: false })
      ]);

      if (activitiesResult.status === 'fulfilled' && activitiesResult.value.data) {
        setActivitiesCost(activitiesResult.value.data);
      }

      if (plotsResult.status === 'fulfilled' && plotsResult.value.data) {
        // Get unique plot IDs
        const uniquePlots = [...new Set(plotsResult.value.data.map((tree: any) => tree.location_id))];
        const plotOptions = ["ทุกแปลง", ...uniquePlots.map(plot => `แปลง ${plot}`)];
        setPlots(plotOptions);
      }

      if (costsResult.status === 'fulfilled' && costsResult.value.data) {
        const costs = costsResult.value.data;
        const total = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
        
        // Calculate this month's costs
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonth = costs
          .filter(cost => {
            const costDate = new Date(cost.cost_date);
            return costDate.getMonth() === currentMonth && costDate.getFullYear() === currentYear;
          })
          .reduce((sum, cost) => sum + (cost.amount || 0), 0);

        setCostSummary({
          total,
          thisMonth,
          entries: costs.length
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const finalActivity = useCustomActivity ? customActivity.trim() : activityType;
    
    if (!finalActivity) {
      toast.error("กรุณาเลือกกิจกรรมหรือระบุกิจกรรมใหม่");
      return;
    }

    if (!target) {
      toast.error("กรุณาเลือกแปลงเป้าหมาย");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    if (!logDate) {
      toast.error("กรุณาเลือกวันที่");
      return;
    }

    setSubmitting(true);

    try {
      // Insert cost record
      const { error } = await supabase.from("tree_costs").insert({
        cost_date: logDate,
        activity_type: finalActivity,
        target: target,
        amount: Number(amount),
        notes: notes.trim() || null,
      });

      if (error) {
        throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      toast.success(`บันทึกค่าใช้จ่าย ${Number(amount).toLocaleString()} บาท สำเร็จ! 💰`);
      
      // Reset form and refresh summary
      resetForm();
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setActivityType("");
    setCustomActivity("");
    setUseCustomActivity(false);
    setTarget("ทุกแปลง");
    setAmount("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  }

  const finalActivityName = useCustomActivity ? customActivity : activitiesCost.find(a => a.name === activityType)?.name || activityType;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
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
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              💰 บันทึกค่าใช้จ่าย
            </h1>
            <p className="text-xl text-gray-600 mb-8">จัดการและติดตามต้นทุนการดำเนินงานของสวน</p>
            
            {/* Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">💸</div>
                  <div className="text-2xl font-bold text-purple-600">{costSummary.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">ค่าใช้จ่ายรวม (บาท)</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-indigo-600">{costSummary.thisMonth.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">เดือนนี้ (บาท)</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-blue-600">{costSummary.entries}</div>
                  <div className="text-sm text-gray-600">รายการทั้งหมด</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs">
                  🔙 กลับหน้าบันทึก
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/report/dashboard">
                  📊 ดูแดชบอร์ด
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/admin">
                  ⚙️ จัดการข้อมูล
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ เลือกกิจกรรม
                  <Badge variant="outline" className="ml-auto">
                    {activitiesCost.length} กิจกรรม
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!useCustomActivity}
                      onChange={() => setUseCustomActivity(false)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium">เลือกจากกิจกรรมที่มี</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={useCustomActivity}
                      onChange={() => setUseCustomActivity(true)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium">ระบุกิจกรรมใหม่</span>
                  </label>
                </div>

                {!useCustomActivity ? (
                  <div>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">เลือกกิจกรรม</option>
                      {activitiesCost.map((activity) => (
                        <option key={activity.id} value={activity.name}>
                          {activity.name}
                        </option>
                      ))}
                    </select>
                    
                    {activityType && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">กิจกรรมที่เลือก:</h4>
                        <p className="text-sm font-medium">{activityType}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Input
                      type="text"
                      placeholder="ระบุกิจกรรมใหม่ (เช่น ซื้อเครื่องมือ, จ้างแรงงาน)"
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                    />
                    {customActivity && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-2">กิจกรรมใหม่:</h4>
                        <p className="text-sm font-medium">{customActivity}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>📋 ข้อมูลค่าใช้จ่าย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    แปลงเป้าหมาย *
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {plots.map((plot) => (
                      <option key={plot} value={plot}>
                        {plot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนเงิน (บาท) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่จ่าย *
                  </label>
                  <Input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
                    placeholder="รายละเอียดเพิ่มเติม, ใบเสร็จ, หรือข้อสังเกต..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Form Summary */}
            <Card>
              <CardHeader>
                <CardTitle>📋 สรุปข้อมูล</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">กิจกรรม:</span>
                    <span className="font-medium">
                      {finalActivityName || 'ยังไม่เลือก'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">แปลงเป้าหมาย:</span>
                    <span className="font-medium">{target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">จำนวน:</span>
                    <span className="font-medium text-purple-600">
                      {amount ? `${Number(amount).toLocaleString()} บาท` : '0 บาท'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันที่:</span>
                    <span className="font-medium">
                      {logDate ? new Date(logDate).toLocaleDateString('th-TH') : 'ยังไม่เลือก'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={handleSubmit}
                  disabled={(!activityType && !customActivity.trim()) || !target || !amount || !logDate || submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    '💰 บันทึกค่าใช้จ่าย'
                  )}
                </Button>
                
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="w-full"
                  disabled={submitting}
                >
                  🔄 ล้างข้อมูล
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/logs">
                    🔙 กลับหน้าบันทึก
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Amount Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>💵 จำนวนเงินด่วน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[100, 500, 1000, 5000, 10000, 20000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount)}
                      className="text-xs"
                    >
                      {quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity List */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ กิจกรรมที่มี</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activitiesCost.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setActivityType(activity.name);
                        setUseCustomActivity(false);
                      }}
                    >
                      {activity.name}
                    </div>
                  ))}
                  {activitiesCost.length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">ไม่มีกิจกรรม</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-purple-800 mb-2">💡 คำแนะนำ</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• บันทึกค่าใช้จ่ายทุกครั้งเพื่อติดตามต้นทุน</li>
                  <li>• ระบุแปลงเป้าหมายให้ชัดเจน</li>
                  <li>• เก็บใบเสร็จไว้อ้างอิง</li>
                  <li>• ข้อมูลจะแสดงในรายงานต้นทุน</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}