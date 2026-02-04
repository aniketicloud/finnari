import { z } from "zod"
import { uuidRegex } from "../validation-utils"

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
})

export const updateLocationSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
  name: z.string().min(1, "Name is required").max(255),
})

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
