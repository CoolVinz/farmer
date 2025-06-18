import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  totalImages: number;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  totalImages,
  onClearFilters
}) => {
  const isFiltered = totalImages > 0;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-200">
      <CardContent className="p-12 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          {isFiltered ? "ไม่พบรูปภาพที่ตรงกับเงื่อนไข" : "ยังไม่มีรูปภาพ"}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {isFiltered 
            ? "ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
            : "เริ่มต้นด้วยการเพิ่มรูปภาพในการบันทึกข้อมูลต้นไม้"
          }
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/logs/add-single">
              📷 {isFiltered ? "เพิ่มรูปภาพใหม่" : "เพิ่มรูปภาพแรก"}
            </Link>
          </Button>
          {isFiltered && onClearFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
            >
              ดูรูปทั้งหมด
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EmptyState.displayName = 'EmptyState';