export interface YieldChangeEvent {
  id: string
  date: Date
  activityType: string
  previousYield: number
  newYield: number
  change: number
  reason: string
  notes: string
}

export interface YieldAnalytics {
  totalIncrease: number
  totalDecrease: number
  netChange: number
  increaseEvents: number
  decreaseEvents: number
  averageChange: number
  peakYield: number
  lowestYield: number
  yieldVelocity: number // change per day
  period: {
    startDate: Date
    endDate: Date
    days: number
  }
}

export interface YieldTrendData {
  date: string
  yield: number
  change: number
  reason: string
  activityType: string
}

/**
 * Parse yield change from log notes
 * Handles patterns like "จาก 10 ลูก เป็น 15 ลูก (+5)" or "เพิ่มผลไม้: จาก 5 ลูก เป็น 10 ลูก (+5)"
 */
export function parseYieldChange(notes: string, activityType: string): { previousYield: number; newYield: number; change: number } | null {
  // Default values
  let previousYield = 0
  let newYield = 0
  let change = 0

  if (!notes) return null

  // Pattern 1: "จาก X ลูก เป็น Y ลูก (±Z)"
  const pattern1 = /จาก\s*(\d+)\s*ลูก\s*เป็น\s*(\d+)\s*ลูก\s*\(([+-]?\d+)\)/
  const match1 = notes.match(pattern1)
  
  if (match1) {
    previousYield = parseInt(match1[1])
    newYield = parseInt(match1[2])
    change = parseInt(match1[3])
    return { previousYield, newYield, change }
  }

  // Pattern 2: Extract numbers from harvest logs (assume decrease)
  if (activityType === 'harvest') {
    const numberPattern = /(\d+)\s*ลูก/g
    const numbers = []
    let match
    while ((match = numberPattern.exec(notes)) !== null) {
      numbers.push(parseInt(match[1]))
    }
    
    if (numbers.length >= 1) {
      // For harvest, assume it's a decrease (harvested amount)
      const harvestedAmount = numbers[0]
      return { previousYield: 0, newYield: 0, change: -harvestedAmount }
    }
  }

  // Pattern 3: Simple change indicators
  if (notes.includes('เพิ่ม')) {
    const numberPattern = /(\d+)/
    const match = notes.match(numberPattern)
    if (match) {
      change = parseInt(match[1])
      return { previousYield: 0, newYield: change, change }
    }
  }

  if (notes.includes('ลด') || notes.includes('เก็บ')) {
    const numberPattern = /(\d+)/
    const match = notes.match(numberPattern)
    if (match) {
      change = -parseInt(match[1])
      return { previousYield: change, newYield: 0, change }
    }
  }

  return null
}

/**
 * Convert tree logs to yield change events
 */
export function parseYieldEvents(logs: any[]): YieldChangeEvent[] {
  const events: YieldChangeEvent[] = []

  // Filter relevant logs
  const yieldLogs = logs.filter(log => 
    log.activityType === 'yield_update' || 
    log.activityType === 'harvest' ||
    (log.notes && (log.notes.includes('ผลไม้') || log.notes.includes('ลูก')))
  )

  for (const log of yieldLogs) {
    const parsed = parseYieldChange(log.notes || '', log.activityType)
    
    if (parsed) {
      events.push({
        id: log.id,
        date: new Date(log.logDate),
        activityType: log.activityType,
        previousYield: parsed.previousYield,
        newYield: parsed.newYield,
        change: parsed.change,
        reason: getReason(log.notes, log.activityType),
        notes: log.notes || ''
      })
    }
  }

  // Sort by date
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Extract reason from notes
 */
function getReason(notes: string, activityType: string): string {
  if (!notes) return activityType

  // Extract reason before the colon
  const colonIndex = notes.indexOf(':')
  if (colonIndex > 0) {
    return notes.substring(0, colonIndex).trim()
  }

  // Common patterns
  if (notes.includes('เพิ่ม')) return 'เพิ่มผลไม้'
  if (notes.includes('ลด')) return 'ลดผลไม้'
  if (notes.includes('เก็บ') || activityType === 'harvest') return 'เก็บเกี่ยว'
  if (notes.includes('ปรับแก้')) return 'ปรับแก้'

  return activityType || 'อื่นๆ'
}

/**
 * Calculate yield analytics for a given period
 */
export function calculateYieldAnalytics(
  events: YieldChangeEvent[], 
  startDate: Date, 
  endDate: Date
): YieldAnalytics {
  // Filter events within period
  const periodEvents = events.filter(event => 
    event.date >= startDate && event.date <= endDate
  )

  const totalIncrease = periodEvents
    .filter(e => e.change > 0)
    .reduce((sum, e) => sum + e.change, 0)

  const totalDecrease = Math.abs(periodEvents
    .filter(e => e.change < 0)
    .reduce((sum, e) => sum + e.change, 0))

  const netChange = totalIncrease - totalDecrease
  const increaseEvents = periodEvents.filter(e => e.change > 0).length
  const decreaseEvents = periodEvents.filter(e => e.change < 0).length
  const totalEvents = periodEvents.length

  // Calculate cumulative yields to find peak and lowest
  let cumulativeYield = 0
  let peakYield = 0
  let lowestYield = 0
  const cumulativeYields = []

  for (const event of periodEvents) {
    cumulativeYield += event.change
    cumulativeYields.push(cumulativeYield)
    peakYield = Math.max(peakYield, cumulativeYield)
    lowestYield = Math.min(lowestYield, cumulativeYield)
  }

  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  const yieldVelocity = totalEvents > 0 ? netChange / days : 0
  const averageChange = totalEvents > 0 ? netChange / totalEvents : 0

  return {
    totalIncrease,
    totalDecrease,
    netChange,
    increaseEvents,
    decreaseEvents,
    averageChange,
    peakYield,
    lowestYield,
    yieldVelocity,
    period: {
      startDate,
      endDate,
      days
    }
  }
}

/**
 * Generate trend data for charting
 */
export function generateYieldTrendData(
  events: YieldChangeEvent[], 
  startDate: Date, 
  endDate: Date
): YieldTrendData[] {
  const periodEvents = events.filter(event => 
    event.date >= startDate && event.date <= endDate
  )

  let cumulativeYield = 0
  const trendData: YieldTrendData[] = []

  for (const event of periodEvents) {
    cumulativeYield += event.change
    
    trendData.push({
      date: event.date.toISOString().split('T')[0],
      yield: cumulativeYield,
      change: event.change,
      reason: event.reason,
      activityType: event.activityType
    })
  }

  return trendData
}

/**
 * Get predefined time periods
 */
export function getTimePeriods() {
  const now = new Date()
  
  return {
    '7days': {
      label: '7 วันที่ผ่านมา',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: now
    },
    '30days': {
      label: '30 วันที่ผ่านมา', 
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: now
    },
    '90days': {
      label: '90 วันที่ผ่านมา',
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      endDate: now
    },
    '1year': {
      label: '1 ปีที่ผ่านมา',
      startDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      endDate: now
    },
    'all': {
      label: 'ทั้งหมด',
      startDate: new Date(2020, 0, 1), // Far past date
      endDate: now
    }
  }
}

/**
 * Format yield change for display
 */
export function formatYieldChange(change: number): string {
  if (change > 0) return `+${change}`
  return change.toString()
}

/**
 * Get change color for UI
 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}