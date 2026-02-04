import { z } from "zod"
import { uuidRegex } from "../validation-utils"

/**
 * Helper for validating optional UUID fields that may be empty strings
 * Converts empty strings to null
 */
const optionalUuidField = () =>
  z
    .string()
    .refine((val) => val === "" || uuidRegex.test(val), {
      message: "Invalid UUID",
    })
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional()

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  parentCategoryId: optionalUuidField(),
})

export const updateCategorySchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
  name: z.string().min(1, "Name is required").max(255).optional(),
  parentCategoryId: optionalUuidField(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
