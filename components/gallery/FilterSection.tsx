import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  activityTypes: string[];
  filteredCount: number;
  onClearFilters: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = React.memo(({
  searchTerm,
  setSearchTerm,
  selectedFilter,
  setSelectedFilter,
  activityTypes,
  filteredCount,
  onClearFilters
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">🔍 ค้นหาและกรองรูปภาพ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ค้นหา
            </label>
            <Input
              type="text"
              placeholder="ค้นหาด้วยรหัสต้น, หมายเหตุ, ตำแหน่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              กรองตามกิจกรรม
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">ทั้งหมด</option>
              {activityTypes.map(activity => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              ผลลัพธ์: {filteredCount} รูป
            </Badge>
            {searchTerm && (
              <Badge variant="secondary">
                ค้นหา: &quot;{searchTerm}&quot;
              </Badge>
            )}
            {selectedFilter !== "all" && (
              <Badge variant="secondary">
                กิจกรรม: {selectedFilter}
              </Badge>
            )}
          </div>
          
          {(searchTerm || selectedFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
            >
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

FilterSection.displayName = 'FilterSection';