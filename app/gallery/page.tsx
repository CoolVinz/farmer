'use client'

import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGalleryImages } from '@/hooks/useGalleryImages';
import { useImageFiltering } from '@/hooks/useImageFiltering';
import { useImagePreview } from '@/hooks/useImagePreview';
import { StatsSection } from '@/components/gallery/StatsSection';
import { FilterSection } from '@/components/gallery/FilterSection';
import { ImageCard } from '@/components/gallery/ImageCard';
import { ImagePreviewModal } from '@/components/gallery/ImagePreviewModal';
import { PaginationControls } from '@/components/gallery/PaginationControls';
import { EmptyState } from '@/components/gallery/EmptyState';
import { calculatePagination } from '@/utils/imageUtils';
import { calculateGalleryStats } from '@/utils/galleryStats';

const GalleryPage: React.FC = () => {
  const { logs, loading, error } = useGalleryImages();
  const {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    page,
    setPage,
    filteredLogs,
    activityTypes,
    clearFilters
  } = useImageFiltering(logs);
  
  const {
    previewLog,
    currentPreviewIndex,
    openPreview,
    closePreview,
    navigatePreview
  } = useImagePreview(filteredLogs);

  const itemsPerPage = 15;
  const { paginatedItems: paginatedLogs, totalPages } = calculatePagination(
    filteredLogs,
    page,
    itemsPerPage
  );
  
  const stats = calculateGalleryStats(logs);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600">{error}</p>
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
            
            <StatsSection
              totalImages={stats.totalImages}
              uniqueTrees={stats.uniqueTrees}
              uniqueActivities={stats.uniqueActivities}
            />
            
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
        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          activityTypes={activityTypes}
          filteredCount={filteredLogs.length}
          onClearFilters={clearFilters}
        />

        {paginatedLogs.length === 0 ? (
          <EmptyState
            totalImages={stats.totalImages}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedLogs.map((log) => (
                <ImageCard
                  key={log.id}
                  log={log}
                  onPreview={openPreview}
                />
              ))}
            </div>

            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </main>

      <ImagePreviewModal
        previewLog={previewLog}
        currentIndex={currentPreviewIndex}
        totalCount={filteredLogs.length}
        onClose={closePreview}
        onNavigate={navigatePreview}
      />
    </div>
  );
};

export default GalleryPage;