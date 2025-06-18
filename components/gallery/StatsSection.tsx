import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsSectionProps {
  totalImages: number;
  uniqueTrees: number;
  uniqueActivities: number;
}

export const StatsSection: React.FC<StatsSectionProps> = React.memo(({
  totalImages,
  uniqueTrees,
  uniqueActivities
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">📸</div>
          <div className="text-2xl font-bold text-purple-600">{totalImages}</div>
          <div className="text-sm text-gray-600">รูปภาพทั้งหมด</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🌳</div>
          <div className="text-2xl font-bold text-green-600">{uniqueTrees}</div>
          <div className="text-sm text-gray-600">ต้นไม้ที่มีรูป</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-blue-600">{uniqueActivities}</div>
          <div className="text-sm text-gray-600">ประเภทกิจกรรม</div>
        </CardContent>
      </Card>
    </div>
  );
});

StatsSection.displayName = 'StatsSection';