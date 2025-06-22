// Repository exports for easy importing
import { TreeRepository } from './tree.repository'
import { TreeLogRepository } from './tree-log.repository'
import { BatchLogRepository } from './batch-log.repository'
import { TreeCostRepository } from './tree-cost.repository'
import { ReferenceDataRepository } from './reference-data.repository'
import { PlotRepository } from './plot.repository'
import { SectionRepository } from './section.repository'

export { TreeRepository, TreeLogRepository, BatchLogRepository, TreeCostRepository, ReferenceDataRepository, PlotRepository, SectionRepository }

// Create singleton instances
export const treeRepository = new TreeRepository()
export const treeLogRepository = new TreeLogRepository()
export const batchLogRepository = new BatchLogRepository()
export const treeCostRepository = new TreeCostRepository()
export const referenceDataRepository = new ReferenceDataRepository()
export const plotRepository = new PlotRepository()
export const sectionRepository = new SectionRepository()