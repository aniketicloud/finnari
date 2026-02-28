import { z } from "zod"

export const wfhSchema = z.object({
  timeIn: z.string().min(1, "Time In is required"),
  timeOut: z.string().min(1, "Time Out is required"),
  totalHours: z
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .max(23, "Must be 23 or less"),
  totalMinutes: z
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .max(59, "Must be 59 or less"),
  gapHours: z
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .max(23, "Must be 23 or less"),
  gapMinutes: z
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .max(59, "Must be 59 or less"),
})
