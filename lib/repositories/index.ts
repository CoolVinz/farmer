// Repository exports for easy importing
import { TreeRepository } from './tree.repository'
import { TreeLogRepository } from './tree-log.repository'
import { ReferenceDataRepository } from './reference-data.repository'

export { TreeRepository, TreeLogRepository, ReferenceDataRepository }

// Create singleton instances
export const treeRepository = new TreeRepository()
export const treeLogRepository = new TreeLogRepository()
export const referenceDataRepository = new ReferenceDataRepository()