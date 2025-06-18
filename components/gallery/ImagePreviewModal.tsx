import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageLog } from '@/hooks/useGalleryImages';
import { getImageUrl } from '@/utils/imageUtils';

interface ImagePreviewModalProps {
  previewLog: ImageLog | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = React.memo(({
  previewLog,
  currentIndex,
  totalCount,
  onClose,
  onNavigate
}) => {
  if (!previewLog) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        {totalCount > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
              onClick={() => onNavigate('prev')}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
              onClick={() => onNavigate('next')}
            >
              →
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
          onClick={onClose}
        >
          ✕
        </Button>
        
        <img
          src={getImageUrl(previewLog.image_path)}
          className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
          alt={previewLog.notes || "Tree image"}
        />
        
        <Card className="mt-4 bg-white/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>🌳 รหัสต้น:</strong> {previewLog.tree_id}</p>
                <p><strong>📍 ตำแหน่ง:</strong> {previewLog.trees?.location_id || "ไม่ระบุ"}</p>
                <p><strong>🌿 พันธุ์:</strong> {previewLog.trees?.variety || "ไม่ระบุ"}</p>
              </div>
              <div>
                <p><strong>📅 วันที่:</strong> {new Date(previewLog.log_date).toLocaleDateString('th-TH')}</p>
                {previewLog.activity_type && (
                  <p><strong>⚡ กิจกรรม:</strong> {previewLog.activity_type}</p>
                )}
                {previewLog.health_status && (
                  <p><strong>🏥 สุขภาพ:</strong> {previewLog.health_status}</p>
                )}
              </div>
            </div>
            {previewLog.notes && (
              <div className="mt-4 pt-4 border-t">
                <p><strong>📝 หมายเหตุ:</strong> {previewLog.notes}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
              รูปที่ {currentIndex + 1} จาก {totalCount} รูป
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

ImagePreviewModal.displayName = 'ImagePreviewModal';