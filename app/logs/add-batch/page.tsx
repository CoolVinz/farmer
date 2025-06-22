'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface Activity {
  id: string;
  name: string;
}

interface Plot {
  id: string;
  code: string;
  name: string;
  sectionCount?: number;
  treeCount?: number;
}

export default function AddBatchLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fertilizers, setFertilizers] = useState<any[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  

  // Form state
  const [selectedPlot, setSelectedPlot] = useState("");
  const [activityType, setActivityType] = useState("");
  const [logDate, setLogDate] = useState("");
  const [notes, setNotes] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("");

  // Custom plot input
  const [customPlot, setCustomPlot] = useState("");
  const [useCustomPlot, setUseCustomPlot] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Set default date to today
    setLogDate(new Date().toISOString().split("T")[0]);
  }, []);

  async function fetchAllData() {
    try {
      // Fetch activities and fertilizers from API routes
      const [activitiesResponse, fertilizersResponse] = await Promise.allSettled([
        fetch('/api/admin/activities'),
        fetch('/api/admin/fertilizers')
      ]);

      if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.ok) {
        const activitiesData = await activitiesResponse.value.json();
        setActivities(activitiesData);
      }
      if (fertilizersResponse.status === 'fulfilled' && fertilizersResponse.value.ok) {
        const fertilizersData = await fertilizersResponse.value.json();
        setFertilizers(fertilizersData);
      }

      // Fetch plots using API route
      try {
        const plotsResponse = await fetch('/api/plots');
        if (plotsResponse.ok) {
          const plotsData = await plotsResponse.json();
          setPlots(plotsData);
        }
      } catch (plotError) {
        console.warn('Plots API not available, using fallback data');
        // Fallback to demo data if API fails
        setPlots([
          { id: '1', code: 'A', name: 'Garden Plot A', sectionCount: 61, treeCount: 98 },
          { id: '2', code: 'B', name: 'Garden Plot B', sectionCount: 0, treeCount: 0 },
          { id: '3', code: 'C', name: 'Garden Plot C', sectionCount: 0, treeCount: 0 }
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const finalPlot = useCustomPlot ? customPlot.trim() : selectedPlot;
    
    if (!finalPlot) {
      toast.error("กรุณาเลือกแปลงหรือระบุแปลงใหม่");
      return;
    }

    if (!logDate) {
      toast.error("กรุณาเลือกวันที่บันทึก");
      return;
    }

    setSubmitting(true);

    try {
      // Insert batch log record via API
      const response = await fetch('/api/logs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_id: finalPlot,
          log_date: logDate,
          activity_id: activityType || null,
          notes: notes.trim() || null,
          fertilizer_name: fertilizerType || null,
          application_method: applicationMethod || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      toast.success(`บันทึกทั้งแปลง ${finalPlot} สำเร็จ! 🎉`);
      
      // Reset form
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedPlot("");
    setCustomPlot("");
    setUseCustomPlot(false);
    setActivityType("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setFertilizerType("");
    setApplicationMethod("");
  }

  const selectedPlotData = plots.find(plot => plot.id === selectedPlot);
  const finalPlotName = useCustomPlot ? customPlot : selectedPlotData?.name || selectedPlot;
  
  // Helper function to determine if activity is fertilizer-related
  const isFertilizerActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return false;
    
    const fertilizerKeywords = ['ปุ๋ย', 'fertilizer', 'ใส่ปุ๋ย', 'น้ำยา', 'สารเคมี', 'ใส่ธาตุอาหาร'];
    return fertilizerKeywords.some(keyword => 
      activity.name.toLowerCase().includes(keyword.toLowerCase())
    );
  };
  
  const showFertilizerFields = isFertilizerActivity(activityType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
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
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
              🌾 บันทึกกิจกรรมแปลง
            </h1>
            <p className="text-xl text-gray-600 mb-8">บันทึกกิจกรรมการดูแลที่ทำกับทั้งแปลงหรือหลายต้นพร้อมกัน</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🏞️</div>
                  <div className="text-2xl font-bold text-yellow-600">{plots.length}</div>
                  <div className="text-sm text-gray-600">แปลงทั้งหมด</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-orange-600">{activities.length}</div>
                  <div className="text-sm text-gray-600">ประเภทกิจกรรม</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">💊</div>
                  <div className="text-2xl font-bold text-amber-600">{fertilizers.length}</div>
                  <div className="text-sm text-gray-600">สูตรปุ๋ย</div>
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
                <Link href="/logs/add-single">
                  🌳 บันทึกรายต้น
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs/cost">
                  💰 บันทึกค่าใช้จ่าย
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
            {/* Plot Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏞️ เลือกแปลง
                  <Badge variant="outline" className="ml-auto">
                    {plots.length} แปลง
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!useCustomPlot}
                      onChange={() => setUseCustomPlot(false)}
                      className="w-4 h-4 text-yellow-600"
                    />
                    <span className="text-sm font-medium">เลือกจากแปลงที่มี</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={useCustomPlot}
                      onChange={() => setUseCustomPlot(true)}
                      className="w-4 h-4 text-yellow-600"
                    />
                    <span className="text-sm font-medium">ระบุแปลงใหม่</span>
                  </label>
                </div>

                {!useCustomPlot ? (
                  <div>
                    <select
                      value={selectedPlot}
                      onChange={(e) => setSelectedPlot(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">เลือกแปลง</option>
                      {plots.map((plot) => (
                        <option key={plot.id} value={plot.id}>
                          แปลง {plot.code} ({plot.sectionCount} แปลงย่อย, {plot.treeCount} ต้น)
                        </option>
                      ))}
                    </select>
                    
                    {selectedPlotData && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">แปลงที่เลือก:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">ชื่อแปลง:</span>
                            <span className="ml-2 font-medium">{selectedPlotData.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">จำนวนต้น:</span>
                            <span className="ml-2 font-medium">{selectedPlotData.treeCount} ต้น</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Input
                      type="text"
                      placeholder="ระบุชื่อแปลงใหม่ (เช่น D, E, เฉพาะพื้นที่)"
                      value={customPlot}
                      onChange={(e) => setCustomPlot(e.target.value)}
                    />
                    {customPlot && (
                      <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">แปลงใหม่:</h4>
                        <p className="text-sm">
                          <span className="text-gray-600">ชื่อ:</span>
                          <span className="ml-2 font-medium">แปลง {customPlot}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>📅 ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่บันทึก *
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
                    placeholder="บันทึกรายละเอียดกิจกรรมที่ทำ, พื้นที่ที่ดำเนินการ, หรือข้อสังเกต..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activity Details */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ รายละเอียดกิจกรรม</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทกิจกรรม
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => {
                      setActivityType(e.target.value);
                      // Clear fertilizer fields when switching activities
                      if (!isFertilizerActivity(e.target.value)) {
                        setFertilizerType("");
                        setApplicationMethod("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">เลือกประเภทกิจกรรม</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show fertilizer fields only when activity is fertilizer-related */}
                {!showFertilizerFields && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-sm text-center">
                      💡 เลือกกิจกรรมที่เกี่ยวข้องกับปุ๋ยเพื่อดูตัวเลือกเพิ่มเติม
                    </p>
                  </div>
                )}
                
                {showFertilizerFields && (
                  <>
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        สูตรปุ๋ย/สารเคมี *
                      </label>
                      <select
                        value={fertilizerType}
                        onChange={(e) => setFertilizerType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">เลือกสูตรปุ๋ยหรือสารเคมี</option>
                        {fertilizers.map((fertilizer) => (
                          <option key={fertilizer.id} value={fertilizer.name}>
                            {fertilizer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        วิธีการใช้ *
                      </label>
                      <select
                        value={applicationMethod}
                        onChange={(e) => setApplicationMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">เลือกวิธีการใช้</option>
                        <option value="ใส่โคนต้น">ใส่โคนต้น</option>
                        <option value="หว่านทั่วแปลง">หว่านทั่วแปลง</option>
                        <option value="ฉีดพ่น">ฉีดพ่น</option>
                        <option value="รดน้ำ">รดน้ำ</option>
                        <option value="ผสมดิน">ผสมดิน</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                  </>
                )}
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
                    <span className="text-gray-600">แปลงที่เลือก:</span>
                    <span className="font-medium">
                      {finalPlotName || 'ยังไม่เลือก'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันที่:</span>
                    <span className="font-medium">
                      {logDate ? new Date(logDate).toLocaleDateString('th-TH') : 'ยังไม่เลือก'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">กิจกรรม:</span>
                    <span className="font-medium">
                      {activities.find(a => a.id === activityType)?.name || 'ไม่ระบุ'}
                    </span>
                  </div>
                  {showFertilizerFields && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ปุ๋ย/สารเคมี:</span>
                        <span className="font-medium">{fertilizerType || 'ไม่ระบุ'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">วิธีการ:</span>
                        <span className="font-medium">{applicationMethod || 'ไม่ระบุ'}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={handleSubmit}
                  disabled={(!selectedPlot && !customPlot.trim()) || !logDate || submitting}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    '✅ บันทึกทั้งแปลง'
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

            {/* Activity List */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ กิจกรรมที่มี</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => setActivityType(activity.id)}
                    >
                      {activity.name}
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-gray-500 text-center py-4 text-sm">ไม่มีกิจกรรม</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-orange-800 mb-2">💡 คำแนะนำ</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• เลือกแปลงที่มีหรือสร้างแปลงใหม่</li>
                  <li>• บันทึกกิจกรรมที่ทำกับหลายต้นพร้อมกัน</li>
                  <li>• ระบุวิธีการใช้ปุ๋ยหรือสารเคมี</li>
                  <li>• ข้อมูลจะแสดงในรายงานการดำเนินงาน</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}