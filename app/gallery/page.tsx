'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface ImageLog {
  id: number;
  tree_id: string;
  notes: string;
  image_path: string;
  log_date: string;
  activity_type?: string;
  health_status?: string;
  trees?: {
    location_id: string;
    tree_number: string;
    variety: string;
  } | null;
}

export default function GalleryPage() {
  const [logs, setLogs] = useState<ImageLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ImageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [previewLog, setPreviewLog] = useState<ImageLog | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    filterAndSearchLogs();
  }, [logs, searchTerm, selectedFilter]);

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from("tree_logs")
        .select(`
          id, 
          tree_id, 
          notes, 
          image_path, 
          log_date, 
          activity_type,
          health_status,
          trees(location_id, tree_number, variety)
        `)
        .not("image_path", "is", null)
        .order("log_date", { ascending: false });

      if (!error && data) {
        // Transform the data to match our interface
        const transformedData = data.map(item => ({
          ...item,
          trees: Array.isArray(item.trees) && item.trees.length > 0 ? item.trees[0] : null
        }));
        setLogs(transformedData as ImageLog[]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSearchLogs() {
    let filtered = logs;

    // Apply activity filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(log => 
        log.activity_type?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.tree_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trees?.location_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trees?.variety?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setPage(1); // Reset to first page when filtering
  }

  function openPreview(log: ImageLog) {
    setPreviewLog(log);
    const index = filteredLogs.findIndex(l => l.id === log.id);
    setCurrentPreviewIndex(index);
  }

  function navigatePreview(direction: 'prev' | 'next') {
    const newIndex = direction === 'next' 
      ? (currentPreviewIndex + 1) % filteredLogs.length
      : (currentPreviewIndex - 1 + filteredLogs.length) % filteredLogs.length;
    
    setCurrentPreviewIndex(newIndex);
    setPreviewLog(filteredLogs[newIndex]);
  }

  function getImageUrl(imagePath: string) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tree-media/${imagePath}`;
  }

  // Get unique activity types for filter
  const activityTypes = [...new Set(logs.map(log => log.activity_type).filter(Boolean))];

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Stats
  const totalImages = logs.length;
  const uniqueActivities = activityTypes.length;
  const uniqueTrees = new Set(logs.map(log => log.tree_id)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดแกลเลอรี...</p>
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
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🖼️ แกลเลอรีรูปภาพ
            </h1>
            <p className="text-xl text-gray-600 mb-8">ชมภาพการดูแลและการเจริญเติบโตของต้นทุเรียน</p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📸</div>
                  <div className="text-2xl font-bold text-purple-600">{totalImages}</div>
                  <div className="text-sm text-gray-600">รูปภาพทั้งหมด</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-green-600">{uniqueTrees}</div>
                  <div className="text-sm text-gray-600">ต้นไม้ที่มีรูป</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-blue-600">{uniqueActivities}</div>
                  <div className="text-sm text-gray-600">ประเภทกิจกรรม</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/logs/add-single">
                  📷 เพิ่มรูปภาพใหม่
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs">
                  📝 ดูบันทึกทั้งหมด
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/report">
                  📊 ดูรายงาน
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">🔍 ค้นหาและกรองรูปภาพ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหา
                </label>
                <Input
                  type="text"
                  placeholder="ค้นหาด้วยรหัสต้น, หมายเหตุ, ตำแหน่ง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  กรองตามกิจกรรม
                </label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">ทั้งหมด</option>
                  {activityTypes.map(activity => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  ผลลัพธ์: {filteredLogs.length} รูป
                </Badge>
                {searchTerm && (
                  <Badge variant="secondary">
                    ค้นหา: &quot;{searchTerm}&quot;
                  </Badge>
                )}
                {selectedFilter !== "all" && (
                  <Badge variant="secondary">
                    กิจกรรม: {selectedFilter}
                  </Badge>
                )}
              </div>
              
              {(searchTerm || selectedFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFilter("all");
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Grid */}
        {paginatedLogs.length === 0 ? (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-200">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {totalImages === 0 ? "ยังไม่มีรูปภาพ" : "ไม่พบรูปภาพที่ตรงกับเงื่อนไข"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {totalImages === 0 
                  ? "เริ่มต้นด้วยการเพิ่มรูปภาพในการบันทึกข้อมูลต้นไม้"
                  : "ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
                }
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/logs/add-single">
                    📷 เพิ่มรูปภาพแรก
                  </Link>
                </Button>
                {totalImages > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFilter("all");
                    }}
                  >
                    ดูรูปทั้งหมด
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedLogs.map((log) => (
                <Card
                  key={log.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                  onClick={() => openPreview(log)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getImageUrl(log.image_path)}
                      alt={log.notes || "Tree image"}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        🔍
                      </div>
                    </div>
                    {log.activity_type && (
                      <Badge 
                        className="absolute top-2 right-2 bg-white/90 text-gray-800"
                        variant="secondary"
                      >
                        {log.activity_type}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-purple-600">
                          🌳 {log.tree_id}
                        </span>
                        {log.health_status && (
                          <Badge variant="outline" className="text-xs">
                            {log.health_status === "healthy" ? "🟢" : log.health_status === "sick" ? "🟡" : "🔴"}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        📍 {log.trees?.location_id || "ไม่ระบุ"}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        📅 {new Date(log.log_date).toLocaleDateString('th-TH')}
                      </p>
                      
                      {log.notes && (
                        <p className="text-xs text-gray-700 line-clamp-2">
                          📝 {log.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    ← ก่อนหน้า
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={page === pageNum ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    ถัดไป →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Enhanced Preview Modal */}
      {previewLog && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewLog(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Navigation arrows */}
            {filteredLogs.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
                  onClick={() => navigatePreview('prev')}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
                  onClick={() => navigatePreview('next')}
                >
                  →
                </Button>
              </>
            )}
            
            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
              onClick={() => setPreviewLog(null)}
            >
              ✕
            </Button>
            
            {/* Image */}
            <img
              src={getImageUrl(previewLog.image_path)}
              className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
              alt={previewLog.notes || "Tree image"}
            />
            
            {/* Image metadata */}
            <Card className="mt-4 bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>🌳 รหัสต้น:</strong> {previewLog.tree_id}</p>
                    <p><strong>📍 ตำแหน่ง:</strong> {previewLog.trees?.location_id || "ไม่ระบุ"}</p>
                    <p><strong>🌿 พันธุ์:</strong> {previewLog.trees?.variety || "ไม่ระบุ"}</p>
                  </div>
                  <div>
                    <p><strong>📅 วันที่:</strong> {new Date(previewLog.log_date).toLocaleDateString('th-TH')}</p>
                    {previewLog.activity_type && (
                      <p><strong>⚡ กิจกรรม:</strong> {previewLog.activity_type}</p>
                    )}
                    {previewLog.health_status && (
                      <p><strong>🏥 สุขภาพ:</strong> {previewLog.health_status}</p>
                    )}
                  </div>
                </div>
                {previewLog.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p><strong>📝 หมายเหตุ:</strong> {previewLog.notes}</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
                  รูปที่ {currentPreviewIndex + 1} จาก {filteredLogs.length} รูป
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}