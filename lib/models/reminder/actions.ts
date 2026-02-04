"use server"

import { db } from "@/drizzle/db"
import { reminder } from "@/drizzle/schema"
import type {
  CreateReminderInput,
  UpdateReminderInput,
  CompleteReminderInput,
} from "./validations"
import {
  createReminderSchema,
  updateReminderSchema,
  completeReminderSchema,
} from "./validations"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createReminder(
  input: CreateReminderInput
): Promise<ActionResponse<typeof reminder.$inferSelect>> {
  try {
    const validated = createReminderSchema.parse(input)

    const [newReminder] = await db
      .insert(reminder)
      .values({
        ...validated,
        status: "pending",
      })
      .returning()

    revalidatePath("/reminders")
    revalidatePath(`/items/${validated.itemId}`)
    return { success: true, data: newReminder }
  } catch (error) {
    console.error("Error creating reminder:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create reminder",
    }
  }
}

export async function updateReminder(
  input: UpdateReminderInput
): Promise<ActionResponse<typeof reminder.$inferSelect>> {
  try {
    const { id, ...data } = updateReminderSchema.parse(input)

    const [updatedReminder] = await db
      .update(reminder)
      .set(data)
      .where(eq(reminder.id, id))
      .returning()

    if (!updatedReminder) {
      return { success: false, error: "Reminder not found" }
    }

    revalidatePath("/reminders")
    revalidatePath(`/reminders/${id}`)
    revalidatePath(`/items/${updatedReminder.itemId}`)
    return { success: true, data: updatedReminder }
  } catch (error) {
    console.error("Error updating reminder:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update reminder",
    }
  }
}

export async function deleteReminder(
  reminderId: string
): Promise<ActionResponse<void>> {
  try {
    const [deletedReminder] = await db
      .delete(reminder)
      .where(eq(reminder.id, reminderId))
      .returning()

    if (!deletedReminder) {
      return { success: false, error: "Reminder not found" }
    }

    revalidatePath("/reminders")
    revalidatePath(`/items/${deletedReminder.itemId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete reminder",
    }
  }
}

export async function completeReminder(
  input: CompleteReminderInput
): Promise<ActionResponse<typeof reminder.$inferSelect>> {
  try {
    const { id } = completeReminderSchema.parse(input)

    const [completedReminder] = await db
      .update(reminder)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(reminder.id, id))
      .returning()

    if (!completedReminder) {
      return { success: false, error: "Reminder not found" }
    }

    revalidatePath("/reminders")
    revalidatePath(`/reminders/${id}`)
    revalidatePath(`/items/${completedReminder.itemId}`)
    return { success: true, data: completedReminder }
  } catch (error) {
    console.error("Error completing reminder:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to complete reminder",
    }
  }
}

export async function markReminderPending(
  reminderId: string
): Promise<ActionResponse<typeof reminder.$inferSelect>> {
  try {
    const [updatedReminder] = await db
      .update(reminder)
      .set({
        status: "pending",
        completedAt: null,
      })
      .where(eq(reminder.id, reminderId))
      .returning()

    if (!updatedReminder) {
      return { success: false, error: "Reminder not found" }
    }

    revalidatePath("/reminders")
    revalidatePath(`/reminders/${reminderId}`)
    revalidatePath(`/items/${updatedReminder.itemId}`)
    return { success: true, data: updatedReminder }
  } catch (error) {
    console.error("Error marking reminder as pending:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark reminder as pending",
    }
  }
}
