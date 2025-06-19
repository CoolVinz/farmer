'use client'

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadCSV } from "@/lib/csv-utils";
import { referenceDataRepository } from "@/lib/repositories";
import { createReferenceDataSchema } from "@/lib/validations";

interface DataItem {
  id: string
  name: string
  createdAt?: Date
}

interface SectionProps {
  title: string
  items: DataItem[]
  type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost'
  input: string
  setInput: (value: string) => void
  addItem: (type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', input: string, callback: () => void) => void
  removeItem: (type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string, itemName: string) => void
}

function exportData(items: DataItem[], type: string, title: string) {
  if (items.length === 0) {
    toast.error('ไม่มีข้อมูลให้ส่งออก')
    return
  }
  
  const csvData = items.map(item => ({
    id: item.id,
    name: item.name,
    created_at: item.createdAt?.toISOString() || new Date().toISOString()
  }))
  
  const filename = `${type}-${new Date().toISOString().split('T')[0]}.csv`
  downloadCSV(csvData, filename)
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  
  const filteredItems = useFilteredItems(items, searchTerm)
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)
  
  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
        
        <div className="space-y-2">
          {paginatedItems.map((item) => (
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
        
        {/* Pagination Controls */}
        {filteredItems.length > itemsPerPage && (
          <div className="mt-4">
            <div className="flex justify-center items-center gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                ◀️
              </Button>
              
              <span className="text-sm text-gray-600">
                หน้า {currentPage} จาก {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                ▶️
              </Button>
            </div>
            
            <div className="text-center text-xs text-gray-500 mt-1">
              แสดง {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} จาก {filteredItems.length} รายการ
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AdminPrismaPage() {
  const [varieties, setVarieties] = useState<DataItem[]>([]);
  const [fertilizers, setFertilizers] = useState<DataItem[]>([]);
  const [pesticides, setPesticides] = useState<DataItem[]>([]);
  const [diseases, setDiseases] = useState<DataItem[]>([]);
  const [activities, setActivities] = useState<DataItem[]>([]);
  const [activitiesCost, setActivitiesCost] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      setLoading(true);
      
      const [v, f, p, d, a, ac] = await Promise.all([
        referenceDataRepository.findMany('variety'),
        referenceDataRepository.findMany('fertilizer'),
        referenceDataRepository.findMany('pesticide'),
        referenceDataRepository.findMany('plantDisease'),
        referenceDataRepository.findMany('activity'),
        referenceDataRepository.findMany('activityCost'),
      ]);

      setVarieties(v || []);
      setFertilizers(f || []);
      setPesticides(p || []);
      setDiseases(d || []);
      setActivities(a || []);
      setActivitiesCost(ac || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error instanceof Error && error.message.includes('Prisma client not properly configured')) {
        toast.error('กรุณากำหนดรหัสผ่านฐานข้อมูลใน .env.local เพื่อใช้งาน Prisma');
      } else {
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  }

  async function addItem(
    type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', 
    value: string, 
    reset: () => void
  ) {
    if (!value.trim()) {
      toast.error('กรุณากรอกชื่อ');
      return;
    }

    try {
      // Validate input
      const validatedData = createReferenceDataSchema.parse({ name: value.trim() });

      // Check for duplicates
      const exists = await referenceDataRepository.nameExists(type, validatedData.name);
      if (exists) {
        toast.error("🚫 รายการนี้มีอยู่แล้ว");
        return;
      }

      // Create new item
      const newItem = await referenceDataRepository.create(type, validatedData);
      
      if (newItem) {
        reset();
        toast.success(`เพิ่ม "${validatedData.name}" สำเร็จ!`);
        
        // Update local state
        const setter = getStateSetter(type);
        setter((prev: DataItem[]) => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      if (error instanceof Error && error.message.includes('Prisma client not properly configured')) {
        toast.error('กรุณากำหนดรหัสผ่านฐานข้อมูลใน .env.local เพื่อใช้งาน Prisma');
      } else {
        toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
      }
    }
  }

  async function removeItem(
    type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', 
    id: string, 
    itemName: string
  ) {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `คุณแน่ใจหรือไม่ที่จะลบ "${itemName}"?\n\nการกระทำนี้ไม่สามารถยกเลิกได้`
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await referenceDataRepository.delete(type, id);
      toast.success(`ลบ "${itemName}" สำเร็จ!`);
      
      // Update local state
      const setter = getStateSetter(type);
      setter((prev: DataItem[]) => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof Error && error.message.includes('Prisma client not properly configured')) {
        toast.error('กรุณากำหนดรหัสผ่านฐานข้อมูลใน .env.local เพื่อใช้งาน Prisma');
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  }

  function getStateSetter(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost') {
    switch (type) {
      case 'variety': return setVarieties;
      case 'fertilizer': return setFertilizers;
      case 'pesticide': return setPesticides;
      case 'plantDisease': return setDiseases;
      case 'activity': return setActivities;
      case 'activityCost': return setActivitiesCost;
      default: throw new Error(`Unknown type: ${type}`);
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
        exportData(data, key, key);
      }
    })
    
    toast.success('ส่งออกข้อมูลทั้งหมดสำเร็จ!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
      <main className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">🛠️ หน้าจัดการข้อมูล (Prisma ORM)</CardTitle>
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
            type="variety"
            input={newVariety}
            setInput={setNewVariety}
          />
          <Section
            addItem={addItem}
            removeItem={removeItem}
            title="💊 ปุ๋ย"
            items={fertilizers}
            type="fertilizer"
            input={newFertilizer}
            setInput={setNewFertilizer}
          />
          <Section
            addItem={addItem}
            removeItem={removeItem}
            title="🦟 ยาฆ่าแมลง"
            items={pesticides}
            type="pesticide"
            input={newPesticide}
            setInput={setNewPesticide}
          />
          <Section
            addItem={addItem}
            removeItem={removeItem}
            title="🍂 โรคพืช"
            items={diseases}
            type="plantDisease"
            input={newDisease}
            setInput={setNewDisease}
          />
          <Section
            addItem={addItem}
            removeItem={removeItem}
            title="⭐️ กิจกรรมของสวน"
            items={activities}
            type="activity"
            input={newActivity}
            setInput={setNewActivity}
          />
          <Section
            addItem={addItem}
            removeItem={removeItem}
            title="💼 กิจกรรมค่าใช้จ่าย"
            items={activitiesCost}
            type="activityCost"
            input={newActivityCost}
            setInput={setNewActivityCost}
          />
        </div>
      </main>
    </div>
  );
}