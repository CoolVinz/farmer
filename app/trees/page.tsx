"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'react-hot-toast'

interface Tree {
  id: string
  treeCode: string
  variety: string
  status: string
  bloomingStatus: string
  plantedDate: string | null
  fruitCount: number
  treeNumber: number
  section?: {
    id: string
    sectionCode: string
    name: string
    plot?: {
      id: string
      code: string
      name: string
    }
  }
}

interface Section {
  id: string
  sectionCode: string
  name: string
  plot: {
    id: string
    code: string
    name: string
  }
}

interface Plot {
  id: string
  code: string
  name: string
}

export default function TreesPage() {
  const router = useRouter()
  const [trees, setTrees] = useState<Tree[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlot, setSelectedPlot] = useState<string>('all')
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedBloomingStatus, setSelectedBloomingStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    fetchTrees()
    fetchSections()
    fetchPlots()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchTrees()
    }, 300)
    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedPlot, selectedSection, selectedStatus, selectedBloomingStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedPlot, selectedSection, selectedStatus, selectedBloomingStatus])

  async function fetchTrees() {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedSection && selectedSection !== 'all') params.append('sectionId', selectedSection)
      
      const response = await fetch(`/api/trees?${params}`)
      const result = await response.json()
      
      if (result.success) {
        let filteredTrees = result.data

        // Client-side filtering for additional criteria
        if (selectedPlot && selectedPlot !== 'all') {
          filteredTrees = filteredTrees.filter((tree: Tree) => 
            tree.section?.plot?.id === selectedPlot
          )
        }
        if (selectedStatus && selectedStatus !== 'all') {
          filteredTrees = filteredTrees.filter((tree: Tree) => 
            tree.status === selectedStatus
          )
        }
        if (selectedBloomingStatus && selectedBloomingStatus !== 'all') {
          filteredTrees = filteredTrees.filter((tree: Tree) => 
            tree.bloomingStatus === selectedBloomingStatus
          )
        }

        setTrees(filteredTrees)
      }
    } catch (error) {
      console.error('Error fetching trees:', error)
      toast.error('ไม่สามารถโหลดข้อมูลต้นไม้ได้')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSections() {
    try {
      // Include plot data and remove pagination limit to get all sections
      const response = await fetch('/api/sections?includePlot=true&limit=1000')
      const result = await response.json()
      if (result.success) {
        setSections(result.data)
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  async function fetchPlots() {
    try {
      const response = await fetch('/api/plots')
      const result = await response.json()
      if (result.success) {
        setPlots(result.data)
      }
    } catch (error) {
      console.error('Error fetching plots:', error)
    }
  }

  async function deleteTree(treeId: string) {
    try {
      const response = await fetch(`/api/trees/${treeId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('ลบต้นไม้เรียบร้อยแล้ว')
        fetchTrees()
      } else {
        toast.error(result.error || 'ไม่สามารถลบต้นไม้ได้')
      }
    } catch (error) {
      console.error('Error deleting tree:', error)
      toast.error('เกิดข้อผิดพลาดในการลบต้นไม้')
    }
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, string> = {
      'alive': 'bg-green-100 text-green-800',
      'dead': 'bg-red-100 text-red-800',
      'sick': 'bg-yellow-100 text-yellow-800'
    }
    const labels: Record<string, string> = {
      'alive': '🌱 มีชีวิต',
      'dead': '🪦 ตายแล้ว',
      'sick': '🤒 ป่วย'
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    )
  }

  function getBloomingStatusBadge(bloomingStatus: string) {
    const variants: Record<string, string> = {
      'blooming': 'bg-pink-100 text-pink-800',
      'budding': 'bg-yellow-100 text-yellow-800',
      'not_blooming': 'bg-gray-100 text-gray-800'
    }
    const labels: Record<string, string> = {
      'blooming': '🌸 กำลังออกดอก',
      'budding': '🌿 มีดอกตูม',
      'not_blooming': '🌱 ยังไม่ออกดอก'
    }
    return (
      <Badge className={variants[bloomingStatus] || 'bg-gray-100 text-gray-800'}>
        {labels[bloomingStatus] || bloomingStatus}
      </Badge>
    )
  }

  function clearFilters() {
    setSearchQuery('')
    setSelectedPlot('all')
    setSelectedSection('all')
    setSelectedStatus('all')
    setSelectedBloomingStatus('all')
    setCurrentPage(1)
  }

  // Calculate pagination
  const totalPages = Math.ceil(trees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTrees = trees.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredSections = selectedPlot && selectedPlot !== 'all'
    ? sections.filter(section => section.plot?.id === selectedPlot)
    : sections

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg">⏳ กำลังโหลดข้อมูลต้นไม้...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌳 จัดการต้นไม้</h1>
          <p className="text-gray-600 mt-1">จำนวนต้นไม้ทั้งหมด: {trees.length} ต้น</p>
        </div>
        <Button 
          onClick={() => router.push('/trees/create')}
          className="bg-green-600 hover:bg-green-700"
        >
          ➕ เพิ่มต้นไม้ใหม่
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">🔍 ค้นหาและกรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="ค้นหาต้นไม้... (รหัส, พันธุ์, พื้นที่)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select value={selectedPlot} onValueChange={setSelectedPlot}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกแปลง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกแปลง</SelectItem>
                {plots.map((plot) => (
                  <SelectItem key={plot.id} value={plot.id}>
                    {plot.code} - {plot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกแผนก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกแผนก</SelectItem>
                {filteredSections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.sectionCode} - {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะต้นไม้" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="alive">🌱 มีชีวิต</SelectItem>
                <SelectItem value="dead">🪦 ตายแล้ว</SelectItem>
                <SelectItem value="sick">🤒 ป่วย</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedBloomingStatus} onValueChange={setSelectedBloomingStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="สถานะการออกดอก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="blooming">🌸 กำลังออกดอก</SelectItem>
                <SelectItem value="budding">🌿 มีดอกตูม</SelectItem>
                <SelectItem value="not_blooming">🌱 ยังไม่ออกดอก</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={clearFilters}>
              🗑️ ล้างตัวกรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTrees.map((tree) => (
          <Card key={tree.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{tree.treeCode}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {tree.section?.plot?.code} → {tree.section?.sectionCode}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  ต้นที่ {tree.treeNumber}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">พันธุ์:</p>
                  <p className="text-sm">{tree.variety || 'ไม่ระบุ'}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {getStatusBadge(tree.status)}
                  {getBloomingStatusBadge(tree.bloomingStatus)}
                </div>
                
                {tree.fruitCount > 0 && (
                  <div className="text-sm">
                    🥭 ผลไม้: {tree.fruitCount} ลูก
                  </div>
                )}
                
                {tree.plantedDate && (
                  <div className="text-sm text-gray-600">
                    📅 ปลูก: {new Date(tree.plantedDate).toLocaleDateString('th-TH')}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/trees/${tree.treeCode}`)}
                    className="flex-1"
                  >
                    👁️ ดู
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/trees/${tree.treeCode}/edit`)}
                    className="flex-1"
                  >
                    ✏️ แก้ไข
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        🗑️
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบต้นไม้</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณแน่ใจหรือไม่ที่จะลบต้นไม้ {tree.treeCode}? 
                          การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteTree(tree.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          ลบ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {trees.length > itemsPerPage && (
        <Card className="mt-6">
          <CardContent className="py-4">
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
          </CardContent>
        </Card>
      )}

      {trees.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-gray-500">
              <div className="text-4xl mb-2">🌳</div>
              <p>ไม่พบต้นไม้ที่ตรงกับเงื่อนไขการค้นหา</p>
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="mt-4"
              >
                ล้างตัวกรอง
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}