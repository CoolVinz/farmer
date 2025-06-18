import { z } from 'zod'

// Tree validations
export const createTreeSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
  variety: z.string().min(1, 'Variety is required'),
  datePlanted: z.string().or(z.date()).optional(),
  status: z.string().optional().default('alive'),
  bloomingStatus: z.enum(['blooming', 'not_blooming', 'budding']).optional().default('not_blooming'),
})

export const updateTreeSchema = createTreeSchema.omit({ sectionId: true }).partial()

// Plot validations
export const createPlotSchema = z.object({
  code: z.string().length(1, 'Plot code must be a single character (A, B, C)').regex(/^[A-C]$/i, 'Plot code must be A, B, or C'),
  name: z.string().min(1, 'Plot name is required'),
  area: z.number().positive('Area must be positive').optional(),
  soilType: z.string().optional(),
  description: z.string().optional(),
})

export const updatePlotSchema = createPlotSchema.omit({ code: true }).partial()

// Section validations
export const createSectionSchema = z.object({
  plotId: z.string().uuid('Invalid plot ID'),
  name: z.string().min(1, 'Section name is required').optional(),
  description: z.string().optional(),
  area: z.number().positive('Area must be positive').optional(),
  soilType: z.string().optional(),
})

export const updateSectionSchema = createSectionSchema.omit({ plotId: true }).partial()

// Tree Log validations
export const createTreeLogSchema = z.object({
  treeId: z.string().uuid('Invalid tree ID'),
  logDate: z.string().or(z.date()),
  notes: z.string().optional(),
  imagePath: z.string().optional(),
  activityType: z.string().optional(),
  healthStatus: z.string().optional(),
  fertilizerType: z.string().optional(),
  batchId: z.string().optional(),
})

export const updateTreeLogSchema = createTreeLogSchema.partial().omit({ treeId: true })

// Batch Log validations
export const createBatchLogSchema = z.object({
  plotId: z.string().min(1, 'Plot ID is required'),
  logDate: z.string().or(z.date()),
  notes: z.string().optional(),
  activityId: z.string().optional(),
  fertilizerName: z.string().optional(),
  applicationMethod: z.string().optional(),
})

export const updateBatchLogSchema = createBatchLogSchema.partial()

// Cost validations
export const createCostSchema = z.object({
  costDate: z.string().or(z.date()),
  activityType: z.string().min(1, 'Activity type is required'),
  target: z.string().min(1, 'Target is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
})

export const updateCostSchema = createCostSchema.partial()

// Reference data validations
export const createReferenceDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export const updateReferenceDataSchema = createReferenceDataSchema.partial()

// Export types
export type CreateTreeInput = z.infer<typeof createTreeSchema>
export type UpdateTreeInput = z.infer<typeof updateTreeSchema>
export type CreatePlotInput = z.infer<typeof createPlotSchema>
export type UpdatePlotInput = z.infer<typeof updatePlotSchema>
export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
export type CreateTreeLogInput = z.infer<typeof createTreeLogSchema>
export type UpdateTreeLogInput = z.infer<typeof updateTreeLogSchema>
export type CreateBatchLogInput = z.infer<typeof createBatchLogSchema>
export type UpdateBatchLogInput = z.infer<typeof updateBatchLogSchema>
export type CreateCostInput = z.infer<typeof createCostSchema>
export type UpdateCostInput = z.infer<typeof updateCostSchema>
export type CreateReferenceDataInput = z.infer<typeof createReferenceDataSchema>
export type UpdateReferenceDataInput = z.infer<typeof updateReferenceDataSchema>