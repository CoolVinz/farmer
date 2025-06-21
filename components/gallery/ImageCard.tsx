import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageLog } from '@/hooks/useGalleryImages';
import { getImageUrl } from '@/lib/utils/imageUtils';

interface ImageCardProps {
  log: ImageLog;
  onPreview: (log: ImageLog) => void;
}

export const ImageCard: React.FC<ImageCardProps> = React.memo(({ log, onPreview }) => {
  const handleClick = () => onPreview(log);

  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden">
        {log.image_path ? (
          <img
            src={getImageUrl(log.image_path)}
            alt={log.notes || "Tree image"}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', getImageUrl(log.image_path), e);
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">🌳</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            🔍
          </div>
        </div>
        {log.activity_type && (
          <Badge 
            className="absolute top-2 right-2 bg-white/90 text-gray-800"
            variant="secondary"
          >
            {log.activity_type}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-600">
              🌳 {log.tree_id}
            </span>
            {log.health_status && (
              <Badge variant="outline" className="text-xs">
                {log.health_status === "healthy" ? "🟢" : log.health_status === "sick" ? "🟡" : "🔴"}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-600">
            📍 {log.trees?.location_id || "ไม่ระบุ"}
          </p>
          
          <p className="text-xs text-gray-500">
            📅 {new Date(log.log_date).toLocaleDateString('th-TH')}
          </p>
          
          {log.notes && (
            <p className="text-xs text-gray-700 line-clamp-2">
              📝 {log.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ImageCard.displayName = 'ImageCard';