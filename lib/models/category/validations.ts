import { z } from "zod"
import { uuidRegex } from "../validation-utils"

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  parentCategoryId: z
    .string()
    .regex(uuidRegex, "Invalid UUID")
    .nullable()
    .optional(),
})

export const updateCategorySchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
  name: z.string().min(1, "Name is required").max(255).optional(),
  parentCategoryId: z
    .string()
    .regex(uuidRegex, "Invalid UUID")
    .nullable()
    .optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
