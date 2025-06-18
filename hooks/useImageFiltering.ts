import { useState, useEffect, useMemo } from 'react';
import { ImageLog } from './useGalleryImages';

export function useImageFiltering(logs: ImageLog[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (selectedFilter !== "all") {
      filtered = filtered.filter(log => 
        log.activity_type?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.tree_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trees?.location_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trees?.variety?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [logs, searchTerm, selectedFilter]);

  const activityTypes = useMemo(() => 
    [...new Set(logs.map(log => log.activity_type).filter(Boolean))] as string[], 
    [logs]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedFilter("all");
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedFilter]);

  return {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    page,
    setPage,
    filteredLogs,
    activityTypes,
    clearFilters
  };
}