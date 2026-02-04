import { z } from "zod"
import { uuidRegex } from "../validation-utils"

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  categoryId: z.string().regex(uuidRegex, "Invalid UUID").nullable().optional(),
  locationId: z.string().regex(uuidRegex, "Invalid UUID").nullable().optional(),
  quantity: z.coerce.number().int().min(0).default(1),
  notes: z.string().optional().nullable(),
})

export const updateItemSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
  name: z.string().min(1, "Name is required").max(255).optional(),
  categoryId: z.string().regex(uuidRegex, "Invalid UUID").nullable().optional(),
  locationId: z.string().regex(uuidRegex, "Invalid UUID").nullable().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
})

export const moveItemSchema = z.object({
  itemId: z.string().regex(uuidRegex, "Invalid UUID"),
  toLocationId: z.string().regex(uuidRegex, "Invalid UUID"),
})

export type CreateItemInput = z.input<typeof createItemSchema>
export type UpdateItemInput = z.input<typeof updateItemSchema>
export type MoveItemInput = z.infer<typeof moveItemSchema>
