import { ImageLog } from '@/hooks/useGalleryImages';

export interface GalleryStats {
  totalImages: number;
  uniqueActivities: number;
  uniqueTrees: number;
}

export function calculateGalleryStats(logs: ImageLog[]): GalleryStats {
  const totalImages = logs.length;
  const uniqueActivities = new Set(logs.map(log => log.activity_type).filter(Boolean)).size;
  const uniqueTrees = new Set(logs.map(log => log.tree_id)).size;

  return {
    totalImages,
    uniqueActivities,
    uniqueTrees
  };
}