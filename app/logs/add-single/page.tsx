'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

interface Tree {
  id: string;
  location_id: string;
  tree_number: string;
  variety: string;
}

interface Activity {
  id: number;
  name: string;
}

interface Fertilizer {
  id: number;
  name: string;
}

interface Disease {
  id: number;
  name: string;
}

export default function AddSingleLogPage() {
  const searchParams = useSearchParams();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [treeId, setTreeId] = useState("");
  const [notes, setNotes] = useState("");
  const [logDate, setLogDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activityType, setActivityType] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");

  // Search state for tree selection
  const [treeSearch, setTreeSearch] = useState("");
  const [showTreeDropdown, setShowTreeDropdown] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Set default date to today
    setLogDate(new Date().toISOString().split("T")[0]);
    
    // Auto-select tree if treeId is provided in URL
    const urlTreeId = searchParams.get('treeId');
    if (urlTreeId) {
      setTreeId(urlTreeId);
    }
  }, [searchParams]);

  async function fetchAllData() {
    try {
      const [treesResult, activitiesResult, fertilizersResult, diseasesResult] = await Promise.allSettled([
        supabase.from("trees").select("id, location_id, tree_number, variety").order("location_id"),
        supabase.from("activities").select("*").order("name"),
        supabase.from("fertilizers").select("*").order("name"),
        supabase.from("plant_diseases").select("*").order("name")
      ]);

      if (treesResult.status === 'fulfilled' && treesResult.value.data) {
        setTrees(treesResult.value.data);
      }
      if (activitiesResult.status === 'fulfilled' && activitiesResult.value.data) {
        setActivities(activitiesResult.value.data);
      }
      if (fertilizersResult.status === 'fulfilled' && fertilizersResult.value.data) {
        setFertilizers(fertilizersResult.value.data);
      }
      if (diseasesResult.status === 'fulfilled' && diseasesResult.value.data) {
        setDiseases(diseasesResult.value.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

  // Update tree search display when trees are loaded and treeId is set
  useEffect(() => {
    if (trees.length > 0 && treeId && !treeSearch) {
      const selectedTree = trees.find(tree => tree.id === treeId);
      if (selectedTree) {
        setTreeSearch(`${selectedTree.location_id} - ${selectedTree.tree_number}`);
      }
    }
  }, [trees, treeId, treeSearch]);

  async function handleSubmit() {
    if (!treeId) {
      toast.error("กรุณาเลือกต้นไม้");
      return;
    }

    if (!logDate) {
      toast.error("กรุณาเลือกวันที่บันทึก");
      return;
    }

    setSubmitting(true);
    let imagePath = null;

    try {
      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${treeId}_${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("tree-media")
          .upload(fileName, imageFile);
        
        if (uploadError) {
          throw new Error("อัปโหลดรูปภาพล้มเหลว");
        }
        imagePath = data?.path || null;
      }

      // Insert log record
      const { error } = await supabase.from("tree_logs").insert({
        tree_id: treeId,
        log_date: logDate,
        notes: notes.trim() || null,
        image_path: imagePath,
        activity_type: activityType || null,
        health_status: healthStatus || null,
        fertilizer_type: fertilizerType || null,
      });

      if (error) {
        throw new Error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      toast.success("บันทึกข้อมูลสำเร็จ! 🎉");
      
      // Reset form
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setTreeId("");
    setTreeSearch("");
    setNotes("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setImageFile(null);
    setPreviewUrl("");
    setActivityType("");
    setHealthStatus("");
    setFertilizerType("");
    setShowTreeDropdown(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    setImageFile(null);
    setPreviewUrl("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }

  function selectTree(tree: Tree) {
    setTreeId(tree.id);
    setTreeSearch(`${tree.location_id} - ${tree.tree_number}`);
    setShowTreeDropdown(false);
  }

  // Filter trees based on search
  const filteredTrees = trees.filter(tree =>
    `${tree.location_id} ${tree.tree_number} ${tree.variety}`.toLowerCase().includes(treeSearch.toLowerCase())
  );

  const selectedTree = trees.find(tree => tree.id === treeId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              🌳 บันทึกข้อมูลรายต้น
            </h1>
            <p className="text-xl text-gray-600 mb-8">เพิ่มข้อมูลการดูแลต้นทุเรียนรายต้น พร้อมรูปภาพและรายละเอียด</p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs">
                  🔙 กลับหน้าบันทึก
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/logs/add-batch">
                  🌾 บันทึกแปลง
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/gallery">
                  🖼️ ดูแกลเลอรี
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
            {/* Tree Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌳 เลือกต้นไม้
                  <Badge variant="outline" className="ml-auto">
                    {trees.length} ต้น
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ค้นหาต้นไม้... (ตำแหน่ง, หมายเลข, พันธุ์)"
                    value={treeSearch}
                    onChange={(e) => {
                      setTreeSearch(e.target.value);
                      setShowTreeDropdown(true);
                      if (!e.target.value) {
                        setTreeId("");
                      }
                    }}
                    onFocus={() => setShowTreeDropdown(true)}
                    className="w-full"
                  />
                  
                  {showTreeDropdown && treeSearch && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-10 mt-1">
                      {filteredTrees.length > 0 ? (
                        filteredTrees.map((tree) => (
                          <div
                            key={tree.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => selectTree(tree)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{tree.location_id} - {tree.tree_number}</span>
                              <Badge variant="secondary" className="text-xs">
                                {tree.variety}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-center">
                          ไม่พบต้นไม้ที่ตรงกับการค้นหา
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedTree && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">ต้นที่เลือก:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">ตำแหน่ง:</span>
                        <span className="ml-2 font-medium">{selectedTree.location_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">หมายเลข:</span>
                        <span className="ml-2 font-medium">{selectedTree.tree_number}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">พันธุ์:</span>
                        <span className="ml-2 font-medium">{selectedTree.variety}</span>
                      </div>
                    </div>
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
                    placeholder="บันทึกรายละเอียดการดูแล, สภาพต้นไม้, หรือข้อสังเกต..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">เลือกประเภทกิจกรรม</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.name}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สุขภาพต้นไม้
                  </label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">เลือกสถานะสุขภาพ</option>
                    <option value="healthy">สุขภาพดี 🟢</option>
                    <option value="fair">ปานกลาง 🟡</option>
                    <option value="poor">ไม่ดี 🔴</option>
                    {diseases.map((disease) => (
                      <option key={disease.id} value={disease.name}>
                        {disease.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สูตรปุ๋ย
                  </label>
                  <select
                    value={fertilizerType}
                    onChange={(e) => setFertilizerType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">เลือกสูตรปุ๋ย</option>
                    {fertilizers.map((fertilizer) => (
                      <option key={fertilizer.id} value={fertilizer.name}>
                        {fertilizer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>📷 รูปภาพ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อัปโหลดรูปภาพต้นไม้
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB
                    </p>
                  </div>
                  
                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full max-h-80 object-cover rounded-lg shadow-md"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        ✕ ลบรูป
                      </Button>
                    </div>
                  )}
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
                    <span className="text-gray-600">ต้นที่เลือก:</span>
                    <span className="font-medium">
                      {selectedTree ? `${selectedTree.location_id}-${selectedTree.tree_number}` : 'ยังไม่เลือก'}
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
                    <span className="font-medium">{activityType || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สุขภาพ:</span>
                    <span className="font-medium">{healthStatus || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ปุ๋ย:</span>
                    <span className="font-medium">{fertilizerType || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">รูปภาพ:</span>
                    <span className="font-medium">{imageFile ? '✅ มี' : '❌ ไม่มี'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!treeId || !logDate || submitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    '✅ บันทึกข้อมูล'
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

            {/* Help Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-800 mb-2">💡 คำแนะนำ</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• เลือกต้นไม้โดยค้นหาจากตำแหน่งหรือหมายเลข</li>
                  <li>• รูปภาพจะช่วยในการติดตามการเจริญเติบโต</li>
                  <li>• กรอกหมายเหตุเพื่อบันทึกรายละเอียดเพิ่มเติม</li>
                  <li>• ข้อมูลที่บันทึกจะแสดงในแกลเลอรีและรายงาน</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}