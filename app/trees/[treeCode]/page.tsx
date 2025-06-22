"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import { YieldManager } from "@/components/YieldManager";
import { YieldHistoryChart } from "@/components/YieldHistoryChart";
import { YieldAnalytics } from "@/components/YieldAnalytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTimePeriods } from "@/lib/utils/yieldCalculations";

interface Tree {
  id: string;
  treeCode: string;
  variety: string;
  status: string;
  bloomingStatus: string;
  plantedDate: string | null;
  fruitCount: number;
  treeNumber: number;
  location_id: string;
  section?: {
    id: string;
    sectionCode: string;
    name: string;
    plot?: {
      id: string;
      code: string;
      name: string;
    };
  };
  logs?: Array<{
    id: string;
    logDate: string;
    activityType: string;
    healthStatus: string;
    fertilizerType: string;
    notes: string;
    imageUrl: string | null;
  }>;
}

export default function TreeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Yield trends state
  const [yieldData, setYieldData] = useState<any>(null);
  const [yieldLoading, setYieldLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    if (params.treeCode) {
      fetchTree(params.treeCode as string);
    }
  }, [params.treeCode]);

  async function fetchTree(treeCode: string) {
    try {
      const response = await fetch(`/api/trees/${treeCode}`);
      const result = await response.json();

      if (result.success) {
        setTree(result.data);
      } else {
        toast.error("ไม่พบข้อมูลต้นไม้");
        router.push("/trees");
      }
    } catch (error) {
      console.error("Error fetching tree:", error);
      toast.error("ไม่สามารถโหลดข้อมูลต้นไม้ได้");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTree() {
    if (!tree) return;

    try {
      const response = await fetch(`/api/trees/${tree.treeCode}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toast.success("ลบต้นไม้เรียบร้อยแล้ว");
        router.push("/trees");
      } else {
        toast.error(result.error || "ไม่สามารถลบต้นไม้ได้");
      }
    } catch (error) {
      console.error("Error deleting tree:", error);
      toast.error("เกิดข้อผิดพลาดในการลบต้นไม้");
    }
  }

  function handleYieldUpdate(newYield: number) {
    if (tree) {
      setTree({ ...tree, fruitCount: newYield });
      // Refresh yield data when yield is updated
      if (yieldData) {
        fetchYieldData(selectedPeriod);
      }
    }
  }

  async function fetchYieldData(period: string) {
    if (!tree) return;
    
    setYieldLoading(true);
    try {
      const response = await fetch(`/api/trees/${tree.treeCode}/yield?period=${period}&analytics=true`);
      const result = await response.json();
      
      if (result.success) {
        setYieldData(result.data);
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลแนวโน้มได้');
      }
    } catch (error) {
      console.error('Error fetching yield data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setYieldLoading(false);
    }
  }

  function handlePeriodChange(period: string) {
    setSelectedPeriod(period);
    fetchYieldData(period);
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, string> = {
      alive: "bg-green-100 text-green-800",
      dead: "bg-red-100 text-red-800",
      sick: "bg-yellow-100 text-yellow-800",
    };
    const labels: Record<string, string> = {
      alive: "🌱 มีชีวิต",
      dead: "🪦 ตายแล้ว",
      sick: "🤒 ป่วย",
    };
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {labels[status] || status}
      </Badge>
    );
  }

  function getBloomingStatusBadge(bloomingStatus: string) {
    const variants: Record<string, string> = {
      blooming: "bg-pink-100 text-pink-800",
      budding: "bg-yellow-100 text-yellow-800",
      not_blooming: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      blooming: "🌸 กำลังออกดอก",
      budding: "🌿 มีดอกตูม",
      not_blooming: "🌱 ยังไม่ออกดอก",
    };
    return (
      <Badge
        className={variants[bloomingStatus] || "bg-gray-100 text-gray-800"}
      >
        {labels[bloomingStatus] || bloomingStatus}
      </Badge>
    );
  }

  function getHealthStatusBadge(healthStatus: string) {
    const variants: Record<string, string> = {
      healthy: "bg-green-100 text-green-800",
      sick: "bg-yellow-100 text-yellow-800",
      pest: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      healthy: "💚 แข็งแรง",
      sick: "🤒 ป่วย",
      pest: "🐛 มีศัตรูพืช",
    };
    return (
      <Badge className={variants[healthStatus] || "bg-gray-100 text-gray-800"}>
        {labels[healthStatus] || healthStatus}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg">⏳ กำลังโหลดข้อมูลต้นไม้...</div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg text-red-600">❌ ไม่พบข้อมูลต้นไม้</div>
          <Button onClick={() => router.push("/trees")} className="mt-4">
            กลับไปหน้ารายการต้นไม้
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/trees")}>
            ← กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tree.treeCode}
            </h1>
            <p className="text-gray-600 mt-1">
              {tree.section?.plot?.name} → {tree.section?.name} (ต้นที่{" "}
              {tree.treeNumber})
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/trees/${tree.treeCode}/edit`)}
          >
            ✏️ แก้ไข
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                🗑️ ลบ
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบต้นไม้</AlertDialogTitle>
                <AlertDialogDescription>
                  คุณแน่ใจหรือไม่ที่จะลบต้นไม้ {tree.treeCode}?
                  การกระทำนี้จะลบข้อมูลทั้งหมดและไม่สามารถย้อนกลับได้
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteTree}
                  className="bg-red-600 hover:bg-red-700"
                >
                  ลบ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">📋 ข้อมูลต้นไม้</TabsTrigger>
          <TabsTrigger value="logs">📜 ประวัติการดูแล</TabsTrigger>
          <TabsTrigger value="harvest">📊 ประวัติการเก็บเกี่ยว</TabsTrigger>
          <TabsTrigger value="trends">📈 แนวโน้มผลผลิต</TabsTrigger>
          <TabsTrigger value="photos">📷 รูปภาพ</TabsTrigger>
        </TabsList>

        {/* Tree Information */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    รหัสต้นไม้
                  </label>
                  <p className="text-lg font-semibold">{tree.treeCode}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ตำแหน่ง
                  </label>
                  <p>{tree.location_id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    พันธุ์
                  </label>
                  <p className="text-lg">{tree.variety || "ไม่ระบุ"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ลำดับต้นไม้
                  </label>
                  <p>ต้นที่ {tree.treeNumber}</p>
                </div>

                {tree.plantedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      วันที่ปลูก
                    </label>
                    <p>
                      {new Date(tree.plantedDate).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle>สถานะปัจจุบัน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    สถานะต้นไม้
                  </label>
                  <div className="mt-1">{getStatusBadge(tree.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    สถานะการออกดอก
                  </label>
                  <div className="mt-1">
                    {getBloomingStatusBadge(tree.bloomingStatus)}
                  </div>
                </div>

                {tree.fruitCount > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      จำนวนผลไม้
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      🥭 {tree.fruitCount} ลูก
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle>ที่ตั้ง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    แปลง
                  </label>
                  <p className="text-lg">
                    {tree.section?.plot?.code} - {tree.section?.plot?.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    โคก
                  </label>
                  <p className="text-lg">{tree.section?.sectionCode}</p>
                </div>
              </CardContent>
            </Card>

            {/* Yield Management */}
            <YieldManager
              treeId={tree.id}
              currentYield={tree.fruitCount}
              onYieldUpdate={handleYieldUpdate}
              onViewTrends={() => {
                // Switch to trends tab
                const trendsTab = document.querySelector('[value="trends"]') as HTMLElement;
                if (trendsTab) {
                  trendsTab.click();
                  // Fetch yield data if not already loaded
                  if (!yieldData) {
                    fetchYieldData(selectedPeriod);
                  }
                }
              }}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>การจัดการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() =>
                    router.push(`/logs/add-single?treeCode=${tree.treeCode}`)
                  }
                  className="w-full"
                  variant="outline"
                >
                  📝 เพิ่มบันทึกการดูแล
                </Button>

                <Button
                  onClick={() => router.push(`/trees/${tree.treeCode}/harvest/add`)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  📊 บันทึกการเก็บเกี่ยว
                </Button>

                <Button
                  onClick={() => router.push(`/trees/${tree.treeCode}/edit`)}
                  className="w-full"
                  variant="outline"
                >
                  ✏️ แก้ไขข้อมูลต้นไม้
                </Button>

                <Button
                  onClick={() => router.push(`/trees?search=${tree.treeCode}`)}
                  className="w-full"
                  variant="outline"
                >
                  🔍 ค้นหาต้นไม้ใกล้เคียง
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Care Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                📜 ประวัติการดูแล
                <Button
                  onClick={() =>
                    router.push(`/logs/add-single?treeCode=${tree.treeCode}`)
                  }
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  ➕ เพิ่มบันทึก
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tree.logs && tree.logs.length > 0 ? (
                <div className="space-y-4">
                  {tree.logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{log.activityType}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(log.logDate).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        {log.healthStatus && (
                          <div>{getHealthStatusBadge(log.healthStatus)}</div>
                        )}
                      </div>

                      {log.fertilizerType && (
                        <p className="text-sm mb-2">
                          <strong>ปุ่ย:</strong> {log.fertilizerType}
                        </p>
                      )}

                      {log.notes && (
                        <p className="text-sm text-gray-700 mb-2">
                          {log.notes}
                        </p>
                      )}

                      {log.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={log.imageUrl}
                            alt="รูปภาพการดูแล"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>ยังไม่มีบันทึกการดูแล</p>
                  <Button
                    onClick={() =>
                      router.push(`/logs/add-single?treeCode=${tree.treeCode}`)
                    }
                    className="mt-4"
                    variant="outline"
                  >
                    เพิ่มบันทึกแรก
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Harvest History */}
        <TabsContent value="harvest">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                📊 ประวัติการเก็บเกี่ยว
                <Button
                  onClick={() => router.push(`/trees/${tree.treeCode}/harvest/add`)}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  ➕ บันทึกการเก็บเกี่ยว
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tree.logs && tree.logs.filter(log => log.activityType === 'harvest').length > 0 ? (
                <div className="space-y-4">
                  {tree.logs
                    .filter(log => log.activityType === 'harvest')
                    .map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 bg-orange-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-orange-800">🥭 การเก็บเกี่ยว</p>
                            <p className="text-sm text-gray-600">
                              {new Date(log.logDate).toLocaleDateString("th-TH")}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                              เก็บเกี่ยว
                            </span>
                          </div>
                        </div>

                        {log.notes && (
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>รายละเอียด:</strong> {log.notes}
                          </div>
                        )}

                        {log.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={log.imageUrl}
                              alt="รูปภาพการเก็บเกี่ยว"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>ยังไม่มีประวัติการเก็บเกี่ยว</p>
                  <Button
                    onClick={() => router.push(`/trees/${tree.treeCode}/harvest/add`)}
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                  >
                    บันทึกการเก็บเกี่ยวครั้งแรก
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yield Trends */}
        <TabsContent value="trends">
          <div className="space-y-6">
            {/* Period Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  📅 เลือกช่วงเวลา
                  <Button
                    onClick={() => fetchYieldData(selectedPeriod)}
                    size="sm"
                    variant="outline"
                    disabled={yieldLoading}
                  >
                    🔄 รีเฟรช
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">ช่วงเวลา:</label>
                  <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(getTimePeriods()).map(([key, period]) => (
                        <SelectItem key={key} value={key}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {yieldData && (
                    <div className="text-sm text-gray-600">
                      {yieldData.events?.length || 0} เหตุการณ์ในช่วงนี้
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Yield History Chart */}
            <YieldHistoryChart
              data={yieldData?.trendData || []}
              period={selectedPeriod}
              loading={yieldLoading}
            />

            {/* Yield Analytics */}
            <YieldAnalytics
              analytics={yieldData?.analytics || null}
              loading={yieldLoading}
            />

            {/* Quick Actions */}
            {yieldData && yieldData.events?.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🚀 เริ่มต้นติดตามผลผลิต</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-600 mb-4">
                      ยังไม่มีข้อมูลการเปลี่ยนแปลงผลผลิตในช่วงเวลานี้
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => {
                          // Switch to info tab to see yield manager
                          const infoTab = document.querySelector('[data-state="inactive"][value="info"]') as HTMLElement;
                          if (infoTab) infoTab.click();
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        📝 อัปเดตจำนวนผลไม้
                      </Button>
                      <Button
                        onClick={() => router.push(`/trees/${tree.treeCode}/harvest/add`)}
                        variant="outline"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        🥭 บันทึกการเก็บเกี่ยว
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Photos */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>📷 รูปภาพ</CardTitle>
            </CardHeader>
            <CardContent>
              {tree.logs && tree.logs.some((log) => log.imageUrl) ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tree.logs
                    .filter((log) => log.imageUrl)
                    .map((log) => (
                      <div key={log.id} className="space-y-2">
                        <img
                          src={log.imageUrl!}
                          alt={`รูปภาพ ${log.activityType}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <p className="text-xs text-gray-600 text-center">
                          {new Date(log.logDate).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📷</div>
                  <p>ยังไม่มีรูปภาพ</p>
                  <Button
                    onClick={() =>
                      router.push(`/logs/add-single?treeCode=${tree.treeCode}`)
                    }
                    className="mt-4"
                    variant="outline"
                  >
                    เพิ่มรูปภาพผ่านบันทึกการดูแล
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
