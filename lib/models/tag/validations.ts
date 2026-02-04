import { z } from "zod"
import { uuidRegex } from "../validation-utils"

export const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export const updateTagSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
  name: z.string().min(1, "Name is required").max(100),
})

export const addTagToItemSchema = z.object({
  itemId: z.string().regex(uuidRegex, "Invalid UUID"),
  tagId: z.string().regex(uuidRegex, "Invalid UUID"),
})

export const removeTagFromItemSchema = z.object({
  itemId: z.string().regex(uuidRegex, "Invalid UUID"),
  tagId: z.string().regex(uuidRegex, "Invalid UUID"),
})

export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type AddTagToItemInput = z.infer<typeof addTagToItemSchema>
export type RemoveTagFromItemInput = z.infer<typeof removeTagFromItemSchema>
