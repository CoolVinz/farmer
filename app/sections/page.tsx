"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "react-hot-toast";

interface SectionData {
  id: string;
  sectionCode: string;
  name?: string;
  description?: string;
  area?: number;
  soilType?: string;
  treeCount: number;
  plot: {
    code: string;
    name: string;
  };
}

interface PlotSummary {
  id: string;
  code: string;
  name: string;
  sectionCount: number;
  treeCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlot, setSelectedPlot] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [itemsPerPage] = useState(8); // Show 8 sections per page
  
  // Create section modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    plotId: '',
    name: '',
    description: '',
    area: '',
    soilType: ''
  });

  // Bulk delete state
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [selectedSectionCodes, setSelectedSectionCodes] = useState<Map<string, string>>(new Map()); // id -> sectionCode
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // All sections state for database-wide selection
  const [totalSectionCount, setTotalSectionCount] = useState(0);
  const [loadingAllSections, setLoadingAllSections] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSections();
  }, [currentPage, selectedPlot]);

  async function fetchData() {
    try {
      // Fetch plots via API
      const plotsResponse = await fetch("/api/plots?includeTreeCount=true");

      if (!plotsResponse.ok) {
        throw new Error("Failed to fetch plots");
      }

      const plotsResult = await plotsResponse.json();

      if (plotsResult.success) {
        setPlots(plotsResult.data);
      } else {
        throw new Error("API returned error for plots");
      }
    } catch (error) {
      console.warn("Using fallback data for plots");
      // Fallback plots data
      const fallbackPlots = [
        {
          id: "1",
          code: "A",
          name: "Garden Plot A",
          sectionCount: 61,
          treeCount: 98,
        },
        {
          id: "2",
          code: "B",
          name: "Garden Plot B",
          sectionCount: 0,
          treeCount: 0,
        },
        {
          id: "3",
          code: "C",
          name: "Garden Plot C",
          sectionCount: 0,
          treeCount: 0,
        },
      ];
      setPlots(fallbackPlots);
    }

    // Initial sections fetch
    await fetchSections();
  }

  async function fetchSections() {
    try {
      setLoading(true);

      // Build URL with pagination and filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        includeTreeCount: "true",
        includePlot: "true",
      });

      if (selectedPlot !== "all") {
        const plotData = plots.find((p) => p.code === selectedPlot);
        if (plotData) {
          params.append("plotId", plotData.id);
        }
      }

      const response = await fetch(`/api/sections?${params}`);
      const result = await response.json();

      if (result.success) {
        setSections(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error("API returned error for sections");
      }
    } catch (error) {
      console.warn("Using fallback data for sections");
      // Fallback sections data
      const fallbackSections = Array.from(
        { length: Math.min(itemsPerPage, 61) },
        (_, i) => ({
          id: `section-${i + 1}`,
          sectionCode: `A${i + 1}`,
          name: `Section A${i + 1}`,
          description: `โคกที่ ${i + 1}`,
          treeCount: Math.floor(Math.random() * 3) + 1,
          plot: { code: "A", name: "Garden Plot A" },
        })
      );

      setSections(fallbackSections);
      setPagination({
        page: currentPage,
        limit: itemsPerPage,
        total: 61,
        totalPages: Math.ceil(61 / itemsPerPage),
        hasNextPage: currentPage < Math.ceil(61 / itemsPerPage),
        hasPreviousPage: currentPage > 1,
      });
    } finally {
      setLoading(false);
    }
  }

  // Filter sections based on search (plot filtering is now handled in API)
  const filteredSections = sections.filter((section) => {
    return (
      section.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle plot filter change
  const handlePlotChange = (plotCode: string) => {
    setSelectedPlot(plotCode);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Handle create section
  async function handleCreateSection() {
    if (!createForm.plotId) {
      toast.error('กรุณาเลือกแปลงหลัก');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plotId: createForm.plotId,
          name: createForm.name.trim() || undefined,
          description: createForm.description.trim() || undefined,
          area: createForm.area ? parseFloat(createForm.area) : undefined,
          soilType: createForm.soilType.trim() || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('สร้างโคกใหม่สำเร็จ! 🎉');
        setShowCreateModal(false);
        setCreateForm({
          plotId: '',
          name: '',
          description: '',
          area: '',
          soilType: ''
        });
        // Refresh sections
        await fetchSections();
      } else {
        throw new Error(result.error || 'Create failed');
      }
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างโคก');
    } finally {
      setCreating(false);
    }
  }

  function handleCancelCreate() {
    setCreateForm({
      plotId: '',
      name: '',
      description: '',
      area: '',
      soilType: ''
    });
    setShowCreateModal(false);
  }

  // Bulk selection handlers
  function handleSectionSelect(sectionId: string, checked: boolean) {
    const newSelected = new Set(selectedSections);
    const newCodes = new Map(selectedSectionCodes);
    
    if (checked) {
      newSelected.add(sectionId);
      // Find section code from current sections
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        newCodes.set(sectionId, section.sectionCode);
      }
    } else {
      newSelected.delete(sectionId);
      newCodes.delete(sectionId);
    }
    
    setSelectedSections(newSelected);
    setSelectedSectionCodes(newCodes);
  }

  function handleSelectAllOnPage() {
    const newSelected = new Set(selectedSections);
    const newCodes = new Map(selectedSectionCodes);
    
    if (selectedSections.size === filteredSections.length && 
        filteredSections.every(s => selectedSections.has(s.id))) {
      // Deselect all current page sections
      filteredSections.forEach(s => {
        newSelected.delete(s.id);
        newCodes.delete(s.id);
      });
    } else {
      // Select all visible sections (add to existing selection)
      filteredSections.forEach(s => {
        newSelected.add(s.id);
        newCodes.set(s.id, s.sectionCode);
      });
    }
    
    setSelectedSections(newSelected);
    setSelectedSectionCodes(newCodes);
  }

  async function handleSelectAllInDatabase() {
    setLoadingAllSections(true);
    try {
      const params = new URLSearchParams();
      if (selectedPlot !== 'all') {
        params.append('plotCode', selectedPlot);
      }

      const response = await fetch(`/api/sections/all-ids?${params}`);
      const result = await response.json();

      if (result.success) {
        const allSectionIds = result.data.sections.map((s: any) => s.id);
        const codesMap = new Map();
        
        // Store both IDs and codes from API response
        result.data.sections.forEach((s: any) => {
          codesMap.set(s.id, s.sectionCode);
        });
        
        setSelectedSections(new Set(allSectionIds));
        setSelectedSectionCodes(codesMap);
        setTotalSectionCount(result.data.total);
        toast.success(`เลือกโคกทั้งหมด ${result.data.total} โคก! 📋`);
      } else {
        throw new Error(result.error || 'Failed to fetch all sections');
      }
    } catch (error) {
      console.error('Error selecting all sections:', error);
      toast.error('เกิดข้อผิดพลาดในการเลือกทั้งหมด');
    } finally {
      setLoadingAllSections(false);
    }
  }

  function clearSelection() {
    setSelectedSections(new Set());
    setSelectedSectionCodes(new Map());
  }

  // Bulk delete handler
  async function handleBulkDelete() {
    // Use stored section codes instead of looking up from current sections
    const sectionCodes = Array.from(selectedSections)
      .map(id => selectedSectionCodes.get(id))
      .filter(Boolean) as string[];

    setBulkDeleting(true);
    try {
      const response = await fetch('/api/sections/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sectionCodes })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`ลบโคก ${selectedSections.size} โคกสำเร็จ! 🗑️`);
        setShowBulkDeleteModal(false);
        clearSelection(); // Use the function to clear both states
        // Refresh sections
        await fetchSections();
      } else {
        throw new Error(result.error || 'Bulk delete failed');
      }
    } catch (error) {
      console.error('Error bulk deleting sections:', error);
      toast.error('เกิดข้อผิดพลาดในการลบโคก');
    } finally {
      setBulkDeleting(false);
    }
  }

  // Group sections by plot
  const sectionsByPlot = filteredSections.reduce((acc, section) => {
    const plotCode = section.plot?.code || "Unknown";
    if (!acc[plotCode]) {
      acc[plotCode] = [];
    }
    acc[plotCode].push(section);
    return acc;
  }, {} as Record<string, SectionData[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูลโคก...</p>
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
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              🌿 จัดการโคก
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              จัดการข้อมูลโคกและต้นไม้ในแต่ละโคก
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🏞️</div>
                  <div className="text-2xl font-bold text-green-600">
                    {plots.length}
                  </div>
                  <div className="text-sm text-gray-600">แปลงหลัก</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {pagination?.total || sections.length}
                  </div>
                  <div className="text-sm text-gray-600">โคกทั้งหมด</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-teal-600">
                    {plots.reduce((sum, plot) => sum + plot.treeCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">ต้นไม้ทั้งหมด</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredSections.length}
                  </div>
                  <div className="text-sm text-gray-600">แปลงที่แสดง</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                ➕ สร้างโคกใหม่
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/80 backdrop-blur"
              >
                <Link href="/admin-prisma">🔧 จัดการข้อมูลอ้างอิง</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/80 backdrop-blur"
              >
                <Link href="/logs/add-batch">📝 บันทึกกิจกรรมแปลง</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/80 backdrop-blur"
              >
                <Link href="/plots">🏞️ ดูแปลงหลัก</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🔍 ค้นหาและกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหาโคก
                </label>
                <Input
                  type="text"
                  placeholder="ค้นหารหัส, ชื่อ, หรือรายละเอียด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  กรองตามแปลงหลัก
                </label>
                <select
                  value={selectedPlot}
                  onChange={(e) => handlePlotChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">แสดงทุกแปลง</option>
                  {plots.map((plot) => (
                    <option key={plot.id} value={plot.code}>
                      แปลง {plot.code} ({plot.sectionCount} โคก)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(searchTerm || selectedPlot !== "all") && (
                  <>
                    <Badge variant="outline">
                      แสดง {filteredSections.length} จาก{" "}
                      {pagination?.total || sections.length} โคก
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        handlePlotChange("all");
                      }}
                    >
                      ล้างตัวกรอง
                    </Button>
                  </>
                )}
              </div>

              {filteredSections.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4">
                    {/* Select current page */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="select-page"
                        checked={filteredSections.length > 0 && filteredSections.every(s => selectedSections.has(s.id))}
                        onChange={handleSelectAllOnPage}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="select-page" className="text-sm text-gray-700">
                        เลือกในหน้านี้ ({filteredSections.length})
                      </label>
                    </div>

                    {/* Select all in database */}
                    <Button
                      onClick={handleSelectAllInDatabase}
                      disabled={loadingAllSections}
                      variant="outline"
                      size="sm"
                      className="text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      {loadingAllSections ? (
                        <>⏳ กำลังโหลด...</>
                      ) : (
                        <>📋 เลือกทั้งหมดในฐานข้อมูล{selectedPlot !== 'all' ? ` (แปลง ${selectedPlot})` : ''}</>
                      )}
                    </Button>
                  </div>
                  
                  {selectedSections.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        เลือกแล้ว {selectedSections.size} โคก
                      </Badge>
                      {selectedSections.size > filteredSections.length && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          รวมจากหลายหน้า
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections by Plot */}
        {Object.entries(sectionsByPlot).map(([plotCode, plotSections]) => {
          const plot = plots.find((p) => p.code === plotCode);

          return (
            <div key={plotCode} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  แปลง {plotCode} - {plot?.name}
                </h2>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  แสดงผลทีละ {plotSections.length} โคก
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plotSections.map((section) => (
                  <Card
                    key={section.id}
                    className={`hover:shadow-lg transition-shadow duration-200 ${
                      selectedSections.has(section.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSections.has(section.id)}
                            onChange={(e) => handleSectionSelect(section.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <CardTitle className="text-lg">
                            {section.sectionCode}
                          </CardTitle>
                        </div>
                        <Badge
                          variant={
                            section.treeCount > 0 ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {section.treeCount} ต้น
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {section.name || `แปลงย่อย ${section.sectionCode}`}
                        </p>
                        {section.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>

                      {section.area && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">พื้นที่:</span>{" "}
                          {section.area} ไร่
                        </div>
                      )}

                      {section.soilType && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">ประเภทดิน:</span>{" "}
                          {section.soilType}
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/sections/${section.sectionCode}`}>
                            📝 จัดการโคก
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ไม่พบโคกที่ค้นหา
              </h3>
              <p className="text-gray-600 mb-4">
                ลองเปลี่ยนคำค้นหาหรือเลือกแปลงหลักอื่น
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  handlePlotChange("all");
                }}
              >
                แสดงทุกโคก
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bulk Action Bar */}
        {selectedSections.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <Card className="shadow-lg border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      เลือกแล้ว {selectedSections.size} โคก
                    </Badge>
                    {selectedSections.size > filteredSections.length && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        จากทั้งฐานข้อมูล
                      </Badge>
                    )}
                    <span className="text-sm text-gray-600">
                      รวมต้นไม้ {Array.from(selectedSections)
                        .map(id => sections.find(s => s.id === id)?.treeCount || 0)
                        .reduce((sum, count) => sum + count, 0)} ต้น
                    </span>
                    {selectedSections.size > 50 && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                        ⚠️ การลบจำนวนมาก
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={bulkDeleting}
                    >
                      🗑️ ลบที่เลือก ({selectedSections.size})
                    </Button>
                    <Button
                      onClick={clearSelection}
                      variant="outline"
                      disabled={bulkDeleting}
                    >
                      ยกเลิกการเลือก
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
            />
          </Card>
        )}
      </main>

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>➕ สร้างโคกใหม่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  แปลงหลัก *
                </label>
                <select
                  value={createForm.plotId}
                  onChange={(e) => setCreateForm({ ...createForm, plotId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">เลือกแปลงหลัก</option>
                  {plots.map((plot) => (
                    <option key={plot.id} value={plot.id}>
                      แปลง {plot.code} - {plot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อโคก
                </label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="เช่น โคกมะม่วง, โคกใหม่"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียด
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="อธิบายลักษณะของโคก"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  พื้นที่ (ไร่)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={createForm.area}
                  onChange={(e) => setCreateForm({ ...createForm, area: e.target.value })}
                  placeholder="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทดิน
                </label>
                <select
                  value={createForm.soilType}
                  onChange={(e) => setCreateForm({ ...createForm, soilType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">เลือกประเภทดิน</option>
                  <option value="ดินร่วน">ดินร่วน</option>
                  <option value="ดินเหนียว">ดินเหนียว</option>
                  <option value="ดินทราย">ดินทราย</option>
                  <option value="ดินร่วนปนทราย">ดินร่วนปนทราย</option>
                  <option value="ดินร่วนเหนียว">ดินร่วนเหนียว</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCreateSection}
                  disabled={creating || !createForm.plotId}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {creating ? 'กำลังสร้าง...' : '💾 สร้างโคก'}
                </Button>
                <Button 
                  onClick={handleCancelCreate}
                  variant="outline"
                  disabled={creating}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-red-600">🗑️ ลบโคกหลายโคก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-700">
                <p className="mb-4">
                  คุณแน่ใจหรือไม่ที่จะลบโคก <strong>{selectedSections.size}</strong> โคกที่เลือก?
                </p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">รายการโคกที่จะลบ:</h4>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    {Array.from(selectedSections).map(sectionId => {
                      const section = sections.find(s => s.id === sectionId);
                      return section ? (
                        <div key={sectionId} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                          <span className="font-medium">{section.sectionCode}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{section.name || 'ไม่มีชื่อ'}</span>
                            <Badge variant={section.treeCount > 0 ? "default" : "secondary"} className="text-xs">
                              {section.treeCount} ต้น
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">รวมทั้งหมด</div>
                    <div className="text-lg font-bold text-blue-800">{selectedSections.size} โคก</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600 font-medium">ต้นไม้ทั้งหมด</div>
                    <div className="text-lg font-bold text-orange-800">
                      {Array.from(selectedSections)
                        .map(id => sections.find(s => s.id === id)?.treeCount || 0)
                        .reduce((sum, count) => sum + count, 0)} ต้น
                    </div>
                  </div>
                </div>

                {Array.from(selectedSections).some(id => {
                  const section = sections.find(s => s.id === id);
                  return section && section.treeCount > 0;
                }) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">⚠️</span>
                      <div className="text-sm text-red-800">
                        <p className="font-medium mb-1">คำเตือนสำคัญ!</p>
                        <p>มีโคกที่มีต้นไม้อยู่ การลบโคกจะลบข้อมูลต้นไม้ทั้งหมดในโคกนั้นด้วย</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-red-600 font-medium">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้!
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowBulkDeleteModal(false)}
                  variant="outline"
                  disabled={bulkDeleting}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button 
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {bulkDeleting ? 'กำลังลบ...' : `🗑️ ลบ ${selectedSections.size} โคก`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
