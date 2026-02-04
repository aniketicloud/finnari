import { z } from "zod"
import { uuidRegex } from "../validation-utils"

export const createReminderSchema = z.object({
  itemId: z.string().regex(uuidRegex, "Invalid UUID"),
  fromLocationId: z
    .string()
    .regex(uuidRegex, "Invalid UUID")
    .nullable()
    .optional(),
  toLocationId: z
    .string()
    .regex(uuidRegex, "Invalid UUID")
    .nullable()
    .optional(),
  description: z.string().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
})

export const updateReminderSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
  description: z.string().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  fromLocationId: z
    .string()
    .regex(uuidRegex, "Invalid UUID")
    .nullable()
    .optional(),
  toLocationId: z
    .string()
    .regex(uuidRegex, "Invalid UUID")
    .nullable()
    .optional(),
})

export const completeReminderSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid UUID"),
})

export type CreateReminderInput = z.input<typeof createReminderSchema>
export type UpdateReminderInput = z.input<typeof updateReminderSchema>
export type CompleteReminderInput = z.infer<typeof completeReminderSchema>
