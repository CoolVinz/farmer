import { useState } from 'react';
import { ImageLog } from './useGalleryImages';

export function useImagePreview(filteredLogs: ImageLog[]) {
  const [previewLog, setPreviewLog] = useState<ImageLog | null>(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const openPreview = (log: ImageLog) => {
    setPreviewLog(log);
    const index = filteredLogs.findIndex(l => l.id === log.id);
    setCurrentPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewLog(null);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentPreviewIndex + 1) % filteredLogs.length
      : (currentPreviewIndex - 1 + filteredLogs.length) % filteredLogs.length;
    
    setCurrentPreviewIndex(newIndex);
    setPreviewLog(filteredLogs[newIndex]);
  };

  return {
    previewLog,
    currentPreviewIndex,
    openPreview,
    closePreview,
    navigatePreview
  };
}