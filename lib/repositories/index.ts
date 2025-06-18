// Repository exports for easy importing
import { TreeRepository } from './tree.repository'
import { TreeLogRepository } from './tree-log.repository'
import { ReferenceDataRepository } from './reference-data.repository'
import { PlotRepository } from './plot.repository'
import { SectionRepository } from './section.repository'

export { TreeRepository, TreeLogRepository, ReferenceDataRepository, PlotRepository, SectionRepository }

// Create singleton instances
export const treeRepository = new TreeRepository()
export const treeLogRepository = new TreeLogRepository()
export const referenceDataRepository = new ReferenceDataRepository()
export const plotRepository = new PlotRepository()
export const sectionRepository = new SectionRepository()