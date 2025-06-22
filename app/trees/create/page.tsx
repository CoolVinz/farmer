"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

interface Section {
  id: string;
  sectionCode: string;
  name: string;
  plot: {
    id: string;
    code: string;
    name: string;
  };
}

interface Plot {
  id: string;
  code: string;
  name: string;
}

interface Variety {
  id: string;
  name: string;
}

export default function CreateTreePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string>("");
  const [showCustomVariety, setShowCustomVariety] = useState(false);
  const [dataLoaded, setDataLoaded] = useState({ sections: false, plots: false });

  const [formData, setFormData] = useState({
    sectionId: "",
    variety: "",
    datePlanted: new Date().toISOString().split("T")[0],
    status: "alive",
    bloomingStatus: "not_blooming",
  });

  useEffect(() => {
    fetchSections();
    fetchPlots();
    fetchVarieties();
  }, []);

  // Handle auto-selection when both data sets are loaded
  useEffect(() => {
    if (dataLoaded.sections && dataLoaded.plots) {
      const sectionCodeParam = searchParams.get('sectionCode');
      if (sectionCodeParam && sections.length > 0) {
        autoSelectSection(sections, sectionCodeParam);
      }
    }
  }, [dataLoaded.sections, dataLoaded.plots, sections, searchParams]);

  function autoSelectSection(sectionsData: Section[], sectionCode: string) {
    const targetSection = sectionsData.find(
      section => section.sectionCode.toUpperCase() === sectionCode.toUpperCase()
    );
    
    if (targetSection) {
      // Auto-select the plot first
      setSelectedPlot(targetSection.plot.id);
      
      // Auto-select the section
      setFormData(prev => ({
        ...prev,
        sectionId: targetSection.id
      }));
      
      // Show success message
      toast.success(`เลือกโคก ${targetSection.sectionCode} เรียบร้อยแล้ว! 🎯`);
    } else {
      // Show warning if section not found
      toast.error(`ไม่พบโคก ${sectionCode} ในระบบ`);
    }
  }

  async function fetchSections() {
    try {
      // Fetch ALL sections without pagination limit
      const response = await fetch("/api/sections?includePlot=true&limit=1000");
      const result = await response.json();
      if (result.success) {
        setSections(result.data);
        setDataLoaded(prev => ({ ...prev, sections: true }));
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("ไม่สามารถโหลดข้อมูลโคกได้");
    }
  }

  async function fetchPlots() {
    try {
      const response = await fetch("/api/plots");
      const result = await response.json();
      if (result.success) {
        setPlots(result.data);
        setDataLoaded(prev => ({ ...prev, plots: true }));
      }
    } catch (error) {
      console.error("Error fetching plots:", error);
      toast.error("ไม่สามารถโหลดข้อมูลแปลงได้");
    }
  }

  async function fetchVarieties() {
    try {
      const response = await fetch("/api/varieties");
      const result = await response.json();
      if (result.success) {
        setVarieties(result.data);
      }
    } catch (error) {
      console.error("Error fetching varieties:", error);
      toast.error("ไม่สามารถโหลดข้อมูลพันธุ์ได้");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.sectionId || !formData.variety) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/trees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("เพิ่มต้นไม้เรียบร้อยแล้ว");
        router.push(`/trees/${result.data.id}`);
      } else {
        toast.error(result.error || "ไม่สามารถเพิ่มต้นไม้ได้");
      }
    } catch (error) {
      console.error("Error creating tree:", error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มต้นไม้");
    } finally {
      setLoading(false);
    }
  }

  function updateFormData(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const filteredSections = selectedPlot
    ? sections.filter((section) => section.plot?.id === selectedPlot)
    : sections;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← กลับ
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🌱 เพิ่มต้นไม้ใหม่
          </h1>
          <p className="text-gray-600 mt-1">กรอกข้อมูลต้นไม้ที่ต้องการเพิ่ม</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลต้นไม้</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plot Selection */}
            <div className="space-y-2">
              <Label>แปลง</Label>
              <Select
                value={selectedPlot}
                onValueChange={(value) => {
                  setSelectedPlot(value);
                  setFormData((prev) => ({ ...prev, sectionId: "" })); // Reset section when plot changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแปลง" />
                </SelectTrigger>
                <SelectContent>
                  {plots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>
                      {plot.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Selection */}
            <div className="space-y-2">
              <Label>
                โคก <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sectionId}
                onValueChange={(value) => updateFormData("sectionId", value)}
                disabled={!selectedPlot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโคก" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.sectionCode}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {selectedPlot
                        ? "ไม่พบโคกในแปลงที่เลือก"
                        : "กรุณาเลือกแปลงก่อน"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {!selectedPlot && (
                <p className="text-sm text-gray-500">กรุณาเลือกแปลงก่อน</p>
              )}
            </div>

            {/* Variety */}
            <div className="space-y-2">
              <Label>
                พันธุ์ <span className="text-red-500">*</span>
              </Label>
              {!showCustomVariety ? (
                <div className="space-y-2">
                  <Select
                    value={formData.variety}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setShowCustomVariety(true);
                        updateFormData("variety", "");
                      } else {
                        updateFormData("variety", value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพันธุ์" />
                    </SelectTrigger>
                    <SelectContent>
                      {varieties.map((variety) => (
                        <SelectItem key={variety.id} value={variety.name}>
                          {variety.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        ➕ เพิ่มพันธุ์ใหม่
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={formData.variety}
                    onChange={(e) => updateFormData("variety", e.target.value)}
                    placeholder="ระบุพันธุ์ใหม่"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomVariety(false);
                      updateFormData("variety", "");
                    }}
                  >
                    ← กลับไปเลือกจากรายการ
                  </Button>
                </div>
              )}
            </div>

            {/* Planted Date */}
            <div className="space-y-2">
              <Label>วันที่ปลูก</Label>
              <Input
                type="date"
                value={formData.datePlanted}
                onChange={(e) => updateFormData("datePlanted", e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>สถานะต้นไม้</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alive">🌱 มีชีวิต</SelectItem>
                  <SelectItem value="sick">🤒 ป่วย</SelectItem>
                  <SelectItem value="dead">🪦 ตายแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blooming Status */}
            <div className="space-y-2">
              <Label>สถานะการออกดอก</Label>
              <Select
                value={formData.bloomingStatus}
                onValueChange={(value) =>
                  updateFormData("bloomingStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_blooming">🌱 ยังไม่ออกดอก</SelectItem>
                  <SelectItem value="budding">🌿 มีดอกตูม</SelectItem>
                  <SelectItem value="blooming">🌸 กำลังออกดอก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.sectionId || !formData.variety}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "⏳ กำลังเพิ่ม..." : "✅ เพิ่มต้นไม้"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      {formData.sectionId && formData.variety && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">🔍 ตัวอย่างข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>แปลง:</strong>{" "}
                {plots.find((p) => p.id === selectedPlot)?.name || "ไม่ระบุ"}
              </div>
              <div>
                <strong>โคก:</strong>{" "}
                {sections.find((s) => s.id === formData.sectionId)?.name ||
                  "ไม่ระบุ"}
              </div>
              <div>
                <strong>พันธุ์:</strong> {formData.variety}
              </div>
              <div>
                <strong>วันที่ปลูก:</strong>{" "}
                {new Date(formData.datePlanted).toLocaleDateString("th-TH")}
              </div>
              <div>
                <strong>สถานะ:</strong>
                {formData.status === "alive"
                  ? "🌱 มีชีวิต"
                  : formData.status === "sick"
                  ? "🤒 ป่วย"
                  : "🪦 ตายแล้ว"}
              </div>
              <div>
                <strong>การออกดอก:</strong>
                {formData.bloomingStatus === "not_blooming"
                  ? "🌱 ยังไม่ออกดอก"
                  : formData.bloomingStatus === "budding"
                  ? "🌿 มีดอกตูม"
                  : "🌸 กำลังออกดอก"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
