export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Construct MinIO URL using public environment variables for client-side access
  const endpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || process.env.MINIO_ENDPOINT;
  const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET || process.env.MINIO_BUCKET || 'tree-media';
  
  if (!endpoint) {
    console.warn('MinIO endpoint not configured for client-side image URLs');
    return '';
  }
  
  return `${endpoint}/${bucket}/${imagePath}`;
}

export function calculatePagination<T>(
  items: T[], 
  page: number, 
  itemsPerPage: number
): {
  paginatedItems: T[];
  totalPages: number;
  currentPage: number;
} {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return {
    paginatedItems,
    totalPages,
    currentPage: page
  };
}