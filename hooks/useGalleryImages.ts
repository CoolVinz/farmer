import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface ImageLog {
  id: number;
  tree_id: string;
  notes: string;
  image_path: string;
  log_date: string;
  activity_type?: string;
  health_status?: string;
  trees?: {
    location_id: string;
    tree_number: string;
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
      
      const { data, error } = await supabase
        .from("tree_logs")
        .select(`
          id, 
          tree_id, 
          notes, 
          image_path, 
          log_date, 
          activity_type,
          health_status,
          trees(location_id, tree_number, variety)
        `)
        .not("image_path", "is", null)
        .order("log_date", { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedData = data.map(item => ({
          ...item,
          trees: Array.isArray(item.trees) && item.trees.length > 0 ? item.trees[0] : null
        }));
        setLogs(transformedData as ImageLog[]);
      }
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