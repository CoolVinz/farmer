export function getImageUrl(imagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tree-media/${imagePath}`;
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