'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function SectionsPage() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlot, setSelectedPlot] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch plots and sections via API
      const [plotsResponse, sectionsResponse] = await Promise.all([
        fetch('/api/plots?includeTreeCount=true'),
        fetch('/api/sections?includeTreeCount=true&includePlot=true')
      ]);

      if (!plotsResponse.ok || !sectionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const plotsResult = await plotsResponse.json();
      const sectionsResult = await sectionsResponse.json();

      if (plotsResult.success && sectionsResult.success) {
        setPlots(plotsResult.data);
        setSections(sectionsResult.data);
      } else {
        throw new Error('API returned error');
      }
    } catch (error) {
      console.warn('Using fallback data for sections');
      // Fallback data
      const fallbackPlots = [
        { id: '1', code: 'A', name: 'Garden Plot A', sectionCount: 61, treeCount: 98 },
        { id: '2', code: 'B', name: 'Garden Plot B', sectionCount: 0, treeCount: 0 },
        { id: '3', code: 'C', name: 'Garden Plot C', sectionCount: 0, treeCount: 0 }
      ];

      const fallbackSections = Array.from({ length: 61 }, (_, i) => ({
        id: `section-${i + 1}`,
        sectionCode: `A${i + 1}`,
        name: `Section A${i + 1}`,
        description: `แปลงย่อยที่ ${i + 1}`,
        treeCount: Math.floor(Math.random() * 3) + 1,
        plot: { code: 'A', name: 'Garden Plot A' }
      }));

      setPlots(fallbackPlots);
      setSections(fallbackSections);
    } finally {
      setLoading(false);
    }
  }

  // Filter sections based on search and plot selection
  const filteredSections = sections.filter(section => {
    const matchesSearch = section.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlot = selectedPlot === "all" || section.plot?.code === selectedPlot;
    
    return matchesSearch && matchesPlot;
  });

  // Group sections by plot
  const sectionsByPlot = filteredSections.reduce((acc, section) => {
    const plotCode = section.plot?.code || 'Unknown';
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
              <p className="text-gray-600">กำลังโหลดข้อมูลแปลงย่อย...</p>
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
              🌿 จัดการแปลงย่อย
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              จัดการข้อมูลแปลงย่อยและต้นไม้ในแต่ละแปลง
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🏞️</div>
                  <div className="text-2xl font-bold text-green-600">{plots.length}</div>
                  <div className="text-sm text-gray-600">แปลงหลัก</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-2xl font-bold text-emerald-600">{sections.length}</div>
                  <div className="text-sm text-gray-600">แปลงย่อยทั้งหมด</div>
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
                  <div className="text-2xl font-bold text-blue-600">{filteredSections.length}</div>
                  <div className="text-sm text-gray-600">แปลงที่แสดง</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/admin-prisma">
                  🔧 จัดการข้อมูลอ้างอิง
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs/add-batch">
                  📝 บันทึกกิจกรรมแปลง
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/plots">
                  🏞️ ดูแปลงหลัก
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
            <CardTitle>🔍 ค้นหาและกรองข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหาแปลงย่อย
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
                  onChange={(e) => setSelectedPlot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">แสดงทุกแปลง</option>
                  {plots.map((plot) => (
                    <option key={plot.id} value={plot.code}>
                      แปลง {plot.code} ({plot.sectionCount} แปลงย่อย)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {(searchTerm || selectedPlot !== "all") && (
              <div className="mt-4 flex items-center gap-4">
                <Badge variant="outline">
                  แสดง {filteredSections.length} จาก {sections.length} แปลงย่อย
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedPlot("all");
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sections by Plot */}
        {Object.entries(sectionsByPlot).map(([plotCode, plotSections]) => {
          const plot = plots.find(p => p.code === plotCode);
          
          return (
            <div key={plotCode} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  แปลง {plotCode} - {plot?.name}
                </h2>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {plotSections.length} แปลงย่อย
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plotSections.map((section) => (
                  <Card key={section.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {section.sectionCode}
                        </CardTitle>
                        <Badge 
                          variant={section.treeCount > 0 ? "default" : "secondary"}
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
                          <span className="font-medium">พื้นที่:</span> {section.area} ไร่
                        </div>
                      )}
                      
                      {section.soilType && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">ประเภทดิน:</span> {section.soilType}
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-gray-200 space-y-2">
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/sections/${section.sectionCode}`}>
                            📝 จัดการแปลงย่อย
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
                ไม่พบแปลงย่อยที่ค้นหา
              </h3>
              <p className="text-gray-600 mb-4">
                ลองเปลี่ยนคำค้นหาหรือเลือกแปลงหลักอื่น
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPlot("all");
                }}
              >
                แสดงทุกแปลงย่อย
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}