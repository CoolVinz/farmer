'use client'

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadCSV } from "@/lib/csv-utils";

interface DataItem {
  id: string
  name: string
  created_at: string
}

interface SectionProps {
  title: string
  items: DataItem[]
  type: string
  input: string
  setInput: (value: string) => void
  addItem: (type: string, input: string, callback: () => void) => void
  removeItem: (type: string, id: string, itemName: string) => void
}

function exportData(items: DataItem[], type: string, title: string) {
  if (items.length === 0) {
    toast.error('ไม่มีข้อมูลให้ส่งออก')
    return
  }
  
  const filename = `${type}-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(items, filename)
  toast.success(`ส่งออกข้อมูล ${title} สำเร็จ!`)
}

function useFilteredItems(items: DataItem[], searchTerm: string) {
  return items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

const Section = ({
  title,
  items,
  type,
  input,
  setInput,
  addItem,
  removeItem,
}: SectionProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const filteredItems = useFilteredItems(items, searchTerm)

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {items.length > 0 && (
            <Button
              onClick={() => exportData(items, type, title)}
              variant="outline"
              size="sm"
            >
              📁 ส่งออก CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`เพิ่ม ${title.replace(/^.+ /, '')}`}
            className="flex-1"
          />
          <Button
            onClick={() => addItem(type, input, () => setInput(""))}
            disabled={!input.trim()}
          >
            เพิ่ม
          </Button>
        </div>
        
        {items.length > 5 && (
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา..."
            className="w-full"
          />
        )}
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{item.name}</span>
              <Button
                onClick={() => removeItem(type, item.id, item.name)}
                variant="destructive"
                size="sm"
              >
                ลบ
              </Button>
            </div>
          ))}
          {filteredItems.length === 0 && items.length > 0 && (
            <p className="text-gray-500 text-center py-4">ไม่พบข้อมูลที่ค้นหา</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminPage() {
  const [varieties, setVarieties] = useState<DataItem[]>([]);
  const [fertilizers, setFertilizers] = useState<DataItem[]>([]);
  const [pesticides, setPesticides] = useState<DataItem[]>([]);
  const [diseases, setDiseases] = useState<DataItem[]>([]);
  const [activities, setActivities] = useState<DataItem[]>([]);
  const [activitiesCost, setActivitiesCost] = useState<DataItem[]>([]);

  const [newVariety, setNewVariety] = useState("");
  const [newFertilizer, setNewFertilizer] = useState("");
  const [newPesticide, setNewPesticide] = useState("");
  const [newDisease, setNewDisease] = useState("");

  const [newActivity, setNewActivity] = useState("");
  const [newActivityCost, setNewActivityCost] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [v, f, p, d, a, ac] = await Promise.all([
      supabase.from("varieties").select("*").order("name"),
      supabase.from("fertilizers").select("*").order("name"),
      supabase.from("pesticides").select("*").order("name"),
      supabase.from("plant_diseases").select("*").order("name"),
      supabase.from("activities").select("*").order("name"),
      supabase.from("activities_cost").select("*").order("name"),
    ]);
    setVarieties(v.data || []);
    setFertilizers(f.data || []);
    setPesticides(p.data || []);
    setDiseases(d.data || []);
    setActivities(a.data || []);
    setActivitiesCost(ac.data || []);
  }

  async function addItem(type: string, value: string, reset: () => void) {
    if (!value) return;

    // ตรวจสอบชื่อซ้ำก่อน insert
    const existing = await supabase
      .from(type)
      .select("name")
      .eq("name", value)
      .maybeSingle();
    if (existing.data) {
      toast.error("🚫 รายการนี้มีอยู่แล้ว");
      return;
    }

    const { data, error } = await supabase
      .from(type)
      .insert({ name: value })
      .select();
    if (!error && data) {
      reset();
      if (type === "varieties") setVarieties((prev) => [...prev, ...data]);
      if (type === "fertilizers") setFertilizers((prev) => [...prev, ...data]);
      if (type === "pesticides") setPesticides((prev) => [...prev, ...data]);
      if (type === "plant_diseases") setDiseases((prev) => [...prev, ...data]);
      if (type === "activities") setActivities((prev) => [...prev, ...data]);
      if (type === "activities_cost")
        setActivitiesCost((prev) => [...prev, ...data]);
    }
  }

  async function removeItem(type: string, id: string, itemName: string) {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `คุณแน่ใจหรือไม่ที่จะลบ "${itemName}"?\n\nการกระทำนี้ไม่สามารถยกเลิกได้`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase.from(type).delete().eq("id", id);
      
      if (error) {
        toast.error(`เกิดข้อผิดพลาดในการลบ: ${error.message}`);
        return;
      }
      
      toast.success(`ลบ "${itemName}" สำเร็จ!`);
      fetchAll();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      console.error('Delete error:', error);
    }
  }

  function exportAllData() {
    const allData = {
      varieties,
      fertilizers,
      pesticides,
      diseases,
      activities,
      activities_cost: activitiesCost
    }
    
    // Export each category as separate CSV files
    Object.entries(allData).forEach(([key, data]) => {
      if (data.length > 0) {
        const filename = `all-${key}-${new Date().toISOString().split('T')[0]}.csv`
        downloadCSV(data, filename)
      }
    })
    
    toast.success('ส่งออกข้อมูลทั้งหมดสำเร็จ!')
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">🛠️ หน้าจัดการข้อมูล (Admin)</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={exportAllData}
                  variant="outline"
                  size="sm"
                >
                  📁 ส่งออกทั้งหมด
                </Button>
                <Button asChild>
                  <Link href="/">
                    🏠 <span className="hidden sm:inline ml-2">กลับหน้าหลัก</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">

        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="🌱 สายพันธุ์ทุเรียน"
          items={varieties}
          type="varieties"
          input={newVariety}
          setInput={setNewVariety}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="💊 ปุ๋ย"
          items={fertilizers}
          type="fertilizers"
          input={newFertilizer}
          setInput={setNewFertilizer}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="🦟 ยาฆ่าแมลง"
          items={pesticides}
          type="pesticides"
          input={newPesticide}
          setInput={setNewPesticide}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="🍂 โรคพืช"
          items={diseases}
          type="plant_diseases"
          input={newDisease}
          setInput={setNewDisease}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="⭐️ กิจกรรมของสวน"
          items={activities}
          type="activities"
          input={newActivity}
          setInput={setNewActivity}
        />

        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="💼 กิจกรรมค่าใช้จ่าย"
          items={activitiesCost}
          type="activities_cost"
          input={newActivityCost}
          setInput={setNewActivityCost}
        />
        </div>
      </main>
    </div>
  );
}
