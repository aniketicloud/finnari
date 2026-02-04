"use server"

import { db } from "@/drizzle/db"
import { item, itemMovement } from "@/drizzle/schema"
import type {
  CreateItemInput,
  UpdateItemInput,
  MoveItemInput,
} from "./validations"
import {
  createItemSchema,
  updateItemSchema,
  moveItemSchema,
} from "./validations"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createItem(
  input: CreateItemInput
): Promise<ActionResponse<typeof item.$inferSelect>> {
  try {
    const validated = createItemSchema.parse(input)

    const [newItem] = await db.insert(item).values(validated).returning()

    revalidatePath("/items")
    return { success: true, data: newItem }
  } catch (error) {
    console.error("Error creating item:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create item",
    }
  }
}

export async function updateItem(
  input: UpdateItemInput
): Promise<ActionResponse<typeof item.$inferSelect>> {
  try {
    const { id, ...data } = updateItemSchema.parse(input)

    const [updatedItem] = await db
      .update(item)
      .set(data)
      .where(eq(item.id, id))
      .returning()

    if (!updatedItem) {
      return { success: false, error: "Item not found" }
    }

    revalidatePath("/items")
    revalidatePath(`/items/${id}`)
    return { success: true, data: updatedItem }
  } catch (error) {
    console.error("Error updating item:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update item",
    }
  }
}

export async function deleteItem(
  itemId: string
): Promise<ActionResponse<void>> {
  try {
    const [deletedItem] = await db
      .delete(item)
      .where(eq(item.id, itemId))
      .returning()

    if (!deletedItem) {
      return { success: false, error: "Item not found" }
    }

    revalidatePath("/items")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error deleting item:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete item",
    }
  }
}

export async function moveItem(
  input: MoveItemInput
): Promise<ActionResponse<void>> {
  try {
    const { itemId, toLocationId } = moveItemSchema.parse(input)

    // Get current item to track previous location
    const [currentItem] = await db
      .select()
      .from(item)
      .where(eq(item.id, itemId))
      .limit(1)

    if (!currentItem) {
      return { success: false, error: "Item not found" }
    }

    // Update item location
    await db
      .update(item)
      .set({ locationId: toLocationId })
      .where(eq(item.id, itemId))

    // Create movement record
    await db.insert(itemMovement).values({
      itemId,
      fromLocationId: currentItem.locationId,
      toLocationId,
    })

    revalidatePath("/items")
    revalidatePath(`/items/${itemId}`)
    revalidatePath("/movements")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error moving item:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move item",
    }
  }
}

export async function archiveItem(
  itemId: string
): Promise<ActionResponse<void>> {
  try {
    const [archivedItem] = await db
      .update(item)
      .set({ isArchived: true })
      .where(eq(item.id, itemId))
      .returning()

    if (!archivedItem) {
      return { success: false, error: "Item not found" }
    }

    revalidatePath("/items")
    revalidatePath(`/items/${itemId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error archiving item:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive item",
    }
  }
}

export async function unarchiveItem(
  itemId: string
): Promise<ActionResponse<void>> {
  try {
    const [unarchivedItem] = await db
      .update(item)
      .set({ isArchived: false })
      .where(eq(item.id, itemId))
      .returning()

    if (!unarchivedItem) {
      return { success: false, error: "Item not found" }
    }

    revalidatePath("/items")
    revalidatePath(`/items/${itemId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to unarchive item",
    }
  }
}
