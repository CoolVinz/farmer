'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Using API routes instead of direct repository access
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
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState<number>(0);
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
      // Fetch data via API routes
      const [activitiesResult, plotsResult, costsResult] = await Promise.allSettled([
        fetch('/api/admin/activity-costs'),
        fetch('/api/plots'),
        fetch('/api/logs/cost')
      ]);

      if (activitiesResult.status === 'fulfilled' && activitiesResult.value.ok) {
        const activities = await activitiesResult.value.json();
        setActivitiesCost(activities);
      }

      if (plotsResult.status === 'fulfilled' && plotsResult.value.ok) {
        const plotsData = await plotsResult.value.json();
        // Get unique plot IDs
        const plotOptions = ["ทุกแปลง", ...plotsData.map((plot: any) => `แปลง ${plot.code}`)];
        setPlots(plotOptions);
      }

      if (costsResult.status === 'fulfilled' && costsResult.value.ok) {
        const { logs: costs } = await costsResult.value.json();
        const total = costs.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
        
        // Calculate this month's costs
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonth = costs
          .filter((cost: any) => {
            const costDate = new Date(cost.cost_date);
            return costDate.getMonth() === currentMonth && costDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);

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
      // Insert cost record via API
      const response = await fetch('/api/logs/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cost_date: logDate,
          activity_type: finalActivity,
          amount: amount,
          target_plot: target,
          notes: notes.trim() || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      toast.success("บันทึกค่าใช้จ่ายสำเร็จ! ✅");
      
      // Reset form
      setActivityType("");
      setTarget("");
      setAmount(0);
      setNotes("");
      setCustomActivity("");
      setUseCustomActivity(false);
      setLogDate(new Date().toISOString().split("T")[0]);
      
      // Refresh data
      await fetchAllData();
      
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] text-[#121a0f]">
        <Navigation />
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="px-4 py-3 text-center">
              <div className="text-lg">กำลังโหลดข้อมูล...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] text-[#121a0f]">
      <Navigation />
      <div className="flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          
          {/* Header */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-4 text-[#121a0f]">
              <Link href="/logs" className="text-[#121a0f] hover:text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-[#121a0f] text-2xl font-bold leading-tight tracking-[-0.015em]">
                💰 เพิ่มค่าใช้จ่าย
              </h1>
            </div>
          </div>

          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 mb-6">
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  ฿{costSummary.total.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">ค่าใช้จ่ายทั้งหมด</div>
              </CardContent>
            </Card>
            
            <Card className="border border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  ฿{costSummary.thisMonth.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">เดือนนี้</div>
              </CardContent>
            </Card>
            
            <Card className="border border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {costSummary.entries}
                </div>
                <div className="text-sm text-purple-600">รายการทั้งหมด</div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="mx-4">
            <CardHeader>
              <CardTitle>บันทึกค่าใช้จ่ายใหม่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Activity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทกิจกรรม *
                </label>
                {!useCustomActivity ? (
                  <div className="space-y-2">
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">เลือกกิจกรรม</option>
                      {activitiesCost.map((activity) => (
                        <option key={activity.id} value={activity.name}>
                          {activity.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUseCustomActivity(true)}
                    >
                      + ระบุกิจกรรมใหม่
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      placeholder="ระบุกิจกรรมใหม่"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUseCustomActivity(false);
                        setCustomActivity("");
                      }}
                    >
                      เลือกจากรายการ
                    </Button>
                  </div>
                )}
              </div>

              {/* Target Plot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  แปลงเป้าหมาย *
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">เลือกแปลง</option>
                  {plots.map((plot, index) => (
                    <option key={index} value={plot}>
                      {plot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนเงิน (บาท) *
                </label>
                <Input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่ *
                </label>
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="รายละเอียดเพิ่มเติม (ไม่จำเป็น)"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {submitting ? "กำลังบันทึก..." : "💾 บันทึกค่าใช้จ่าย"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex justify-center gap-4 px-4 py-6">
            <Link href="/logs">
              <Button variant="outline">📝 ดูบันทึกทั้งหมด</Button>
            </Link>
            <Link href="/report/cost">
              <Button variant="outline">📊 รายงานค่าใช้จ่าย</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}