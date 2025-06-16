// CSV utility functions for export/import functionality

export function downloadCSV(data: any[], filename: string) {
  if (!data.length) return

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n')
  const result: string[][] = []
  
  for (const line of lines) {
    if (line.trim()) {
      // Simple CSV parser (doesn't handle all edge cases)
      const row = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      result.push(row)
    }
  }
  
  return result
}

export function validateCSVData(data: string[][], requiredColumns: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (data.length === 0) {
    errors.push('ไฟล์ CSV ว่างเปล่า')
    return { valid: false, errors }
  }
  
  const headers = data[0]
  
  // Check required columns
  for (const column of requiredColumns) {
    if (!headers.includes(column)) {
      errors.push(`ไม่พบคอลัมน์ที่จำเป็น: ${column}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}