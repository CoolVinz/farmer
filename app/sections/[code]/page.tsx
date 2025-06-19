'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface SectionDetail {
  id: string;
  sectionCode: string;
  name?: string;
  description?: string;
  area?: number;
  soilType?: string;
  plot: {
    id: string;
    code: string;
    name: string;
  };
}

interface TreeData {
  id: string;
  treeCode: string;
  treeNumber: number;
  variety?: string;
  status?: string;
  bloomingStatus?: string;
  plantedDate?: Date;
  fruitCount?: number;
}

export default function SectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sectionCode = params.code as string;

  const [section, setSection] = useState<SectionDetail | null>(null);
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    area: '',
    soilType: ''
  });

  useEffect(() => {
    if (sectionCode) {
      fetchSectionData();
    }
  }, [sectionCode]);

  async function fetchSectionData() {
    console.log('Fetching section data for:', sectionCode);
    try {
      // Fetch section details via API
      const response = await fetch(`/api/sections/${sectionCode}?includeTrees=true&includePlot=true`);
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        console.log('API Response not OK:', response.status, response.statusText);
        if (response.status === 404) {
          // Section not found
          console.log('Section not found - 404');
          setSection(null);
          return;
        }
        throw new Error('Failed to fetch section');
      }

      const result = await response.json();
      console.log('API Response data:', result);
      
      if (result.success && result.data) {
        const { section: sectionData, trees: treesData } = result.data;
        
        console.log('Setting section data:', sectionData);
        setSection(sectionData);
        setTrees(treesData || []);
        
        console.log('Setting edit form with:', {
          name: sectionData.name || '',
          description: sectionData.description || '',
          area: sectionData.area?.toString() || '',
          soilType: sectionData.soilType || ''
        });
        setEditForm({
          name: sectionData.name || '',
          description: sectionData.description || '',
          area: sectionData.area?.toString() || '',
          soilType: sectionData.soilType || ''
        });
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error fetching section:', error);
      
      // Fallback data for demo
      const fallbackSection = {
        id: `section-${sectionCode}`,
        sectionCode: sectionCode,
        name: `Section ${sectionCode}`,
        description: `แปลงย่อย ${sectionCode}`,
        area: 0.5,
        soilType: 'ดินร่วน',
        plot: {
          id: '1',
          code: sectionCode.charAt(0),
          name: `Garden Plot ${sectionCode.charAt(0)}`
        }
      };

      const fallbackTrees = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
        id: `tree-${i + 1}`,
        treeCode: `${sectionCode}-T${i + 1}`,
        treeNumber: i + 1,
        variety: 'มะม่วงโบราณ',
        status: 'alive',
        bloomingStatus: i === 0 ? 'blooming' : 'not_blooming',
        fruitCount: Math.floor(Math.random() * 10)
      }));

      setSection(fallbackSection);
      setTrees(fallbackTrees);
      
      setEditForm({
        name: fallbackSection.name,
        description: fallbackSection.description,
        area: fallbackSection.area?.toString() || '',
        soilType: fallbackSection.soilType || ''
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!section) return;

    setSaving(true);
    try {
      const updateData = {
        name: editForm.name.trim() || undefined,
        description: editForm.description.trim() || undefined,
        area: editForm.area ? parseFloat(editForm.area) : undefined,
        soilType: editForm.soilType.trim() || undefined
      };

      const response = await fetch(`/api/sections/${sectionCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update section');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setSection({
          ...section,
          ...updateData
        });

        setEditing(false);
        toast.success('บันทึกข้อมูลแปลงย่อยสำเร็จ! 🎉');
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!section) return;
    
    setEditForm({
      name: section.name || '',
      description: section.description || '',
      area: section.area?.toString() || '',
      soilType: section.soilType || ''
    });
    setEditing(false);
  }

  // Calculate pagination for trees
  const totalPages = Math.ceil(trees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrees = trees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBloomingIcon = (status?: string) => {
    switch (status) {
      case 'blooming': return '🌸';
      case 'budding': return '🌿';
      case 'not_blooming': return '🌱';
      default: return '🌱';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'alive': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-yellow-100 text-yellow-800';
      case 'dead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (!section) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ไม่พบแปลงย่อย {sectionCode}
              </h3>
              <p className="text-gray-600 mb-4">
                แปลงย่อยที่คุณค้นหาไม่มีในระบบ
              </p>
              <Button asChild>
                <Link href="/sections">
                  กลับหน้าจัดการแปลงย่อย
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm text-gray-600 mb-2">
                <Link href="/sections" className="hover:text-green-600">จัดการแปลงย่อย</Link>
                <span className="mx-2">›</span>
                <Link href={`/plots`} className="hover:text-green-600">แปลง {section.plot.code}</Link>
                <span className="mx-2">›</span>
                <span className="font-medium">{section.sectionCode}</span>
              </nav>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                แปลงย่อย {section.sectionCode}
              </h1>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  {section.plot.name}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {trees.length} ต้น
                </Badge>
                {trees.filter(t => t.bloomingStatus === 'blooming').length > 0 && (
                  <Badge className="bg-pink-100 text-pink-800 text-sm">
                    🌸 {trees.filter(t => t.bloomingStatus === 'blooming').length} ต้นออกดอก
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!editing ? (
                <Button 
                  onClick={() => {
                    console.log('Edit button clicked');
                    setEditing(true);
                  }} 
                  variant="outline"
                >
                  ✏️ แก้ไขข้อมูล
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    ยกเลิก
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📋 ข้อมูลแปลงย่อย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อแปลงย่อย
                      </label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="เช่น มะม่วงโบราณ, แปลงใหม่"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        รายละเอียด
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="อธิบายลักษณะของแปลงย่อย เช่น ต้นเก่า, ดินดี"
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
                        value={editForm.area}
                        onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                        placeholder="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ประเภทดิน
                      </label>
                      <select
                        value={editForm.soilType}
                        onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
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
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">ชื่อแปลงย่อย:</span>
                        <p className="font-medium">{section.name || 'ไม่ระบุ'}</p>
                      </div>
                      
                      {section.description && (
                        <div>
                          <span className="text-sm text-gray-600">รายละเอียด:</span>
                          <p className="font-medium">{section.description}</p>
                        </div>
                      )}
                      
                      {section.area && (
                        <div>
                          <span className="text-sm text-gray-600">พื้นที่:</span>
                          <p className="font-medium">{section.area} ไร่</p>
                        </div>
                      )}
                      
                      {section.soilType && (
                        <div>
                          <span className="text-sm text-gray-600">ประเภทดิน:</span>
                          <p className="font-medium">{section.soilType}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>📊 สถิติต้นไม้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ต้นทั้งหมด:</span>
                    <span className="font-bold">{trees.length} ต้น</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ออกดอก:</span>
                    <span className="font-bold text-pink-600">
                      {trees.filter(t => t.bloomingStatus === 'blooming').length} ต้น 🌸
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ยังไม่ออกดอก:</span>
                    <span className="font-bold text-green-600">
                      {trees.filter(t => t.bloomingStatus === 'not_blooming').length} ต้น 🌱
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ผลรวม:</span>
                    <span className="font-bold text-orange-600">
                      {trees.reduce((sum, tree) => sum + (tree.fruitCount || 0), 0)} ผล
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trees List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>🌳 ต้นไม้ในแปลงย่อย</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {trees.length} ต้น
                    </Badge>
                    <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                      <Link href={`/trees/create?sectionCode=${section.sectionCode}`}>
                        ➕ เพิ่มต้นไม้
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {trees.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ยังไม่มีต้นไม้ในแปลงย่อยนี้
                    </h3>
                    <p className="text-gray-600 mb-4">
                      เริ่มต้นโดยการเพิ่มต้นไม้แรกในแปลงย่อย {section.sectionCode}
                    </p>
                    <Button variant="outline" asChild>
                      <Link href={`/trees/create?sectionCode=${section.sectionCode}`}>
                        ➕ เพิ่มต้นไม้
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedTrees.map((tree) => (
                      <Card key={tree.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">
                              {tree.treeCode}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">
                                {getBloomingIcon(tree.bloomingStatus)}
                              </span>
                              <Badge 
                                className={`text-xs ${getStatusColor(tree.status)}`}
                                variant="secondary"
                              >
                                {tree.status === 'alive' ? 'มีชีวิต' : 
                                 tree.status === 'sick' ? 'ป่วย' : 
                                 tree.status === 'dead' ? 'ตาย' : 'ไม่ระบุ'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {tree.variety && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">พันธุ์:</span>
                                <span className="font-medium">{tree.variety}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between">
                              <span className="text-gray-600">สถานะดอก:</span>
                              <span className="font-medium">
                                {tree.bloomingStatus === 'blooming' ? 'ออกดอก' : 
                                 tree.bloomingStatus === 'budding' ? 'เป็นตูม' : 
                                 'ยังไม่ออกดอก'}
                              </span>
                            </div>
                            
                            {tree.fruitCount !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">จำนวนผล:</span>
                                <span className="font-medium">{tree.fruitCount} ผล</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              asChild
                            >
                              <Link href={`/trees/${tree.id}`}>
                                👁️ ดูต้นไม้
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              asChild
                            >
                              <Link href={`/trees/${tree.id}/edit`}>
                                ✏️ แก้ไขต้นไม้
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {trees.length > itemsPerPage && (
                      <div className="mt-6">
                        <div className="flex justify-center items-center gap-4">
                          <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                          >
                            ◀️ ก่อนหน้า
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          
                          <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                          >
                            ถัดไป ▶️
                          </Button>
                        </div>
                        
                        <div className="text-center text-sm text-gray-600 mt-2">
                          แสดง {startIndex + 1}-{Math.min(endIndex, trees.length)} จาก {trees.length} ต้น
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}