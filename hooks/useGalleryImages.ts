import { useState, useEffect, useCallback } from 'react';

export interface ImageLog {
  id: string;
  tree_id: string;
  notes: string;
  image_path: string;
  log_date: Date;
  activity_type?: string;
  health_status?: string;
  trees?: {
    location_id: string;
    tree_number: number;
    variety: string;
  } | null;
}

export function useGalleryImages() {
  const [logs, setLogs] = useState<ImageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/gallery/images');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch images');
      }
      
      const data = await response.json();
      
      // Convert date strings back to Date objects
      const processedData = data.map((item: any) => ({
        ...item,
        log_date: new Date(item.log_date)
      }));
      
      setLogs(processedData);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("เกิดข้อผิดพลาดในการโหลดรูปภาพ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    logs,
    loading,
    error,
    refetch: fetchImages
  };
}