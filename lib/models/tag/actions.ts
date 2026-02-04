"use server"

import { db } from "@/drizzle/db"
import { tag, itemTag } from "@/drizzle/schema"
import type {
  CreateTagInput,
  UpdateTagInput,
  AddTagToItemInput,
  RemoveTagFromItemInput,
} from "./validations"
import {
  createTagSchema,
  updateTagSchema,
  addTagToItemSchema,
  removeTagFromItemSchema,
} from "./validations"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createTag(
  input: CreateTagInput
): Promise<ActionResponse<typeof tag.$inferSelect>> {
  try {
    const validated = createTagSchema.parse(input)

    const [newTag] = await db.insert(tag).values(validated).returning()

    revalidatePath("/tags")
    return { success: true, data: newTag }
  } catch (error) {
    console.error("Error creating tag:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tag",
    }
  }
}

export async function updateTag(
  input: UpdateTagInput
): Promise<ActionResponse<typeof tag.$inferSelect>> {
  try {
    const { id, ...data } = updateTagSchema.parse(input)

    const [updatedTag] = await db
      .update(tag)
      .set(data)
      .where(eq(tag.id, id))
      .returning()

    if (!updatedTag) {
      return { success: false, error: "Tag not found" }
    }

    revalidatePath("/tags")
    revalidatePath(`/tags/${id}`)
    return { success: true, data: updatedTag }
  } catch (error) {
    console.error("Error updating tag:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tag",
    }
  }
}

export async function deleteTag(tagId: string): Promise<ActionResponse<void>> {
  try {
    const [deletedTag] = await db
      .delete(tag)
      .where(eq(tag.id, tagId))
      .returning()

    if (!deletedTag) {
      return { success: false, error: "Tag not found" }
    }

    revalidatePath("/tags")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error deleting tag:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tag",
    }
  }
}

export async function addTagToItem(
  input: AddTagToItemInput
): Promise<ActionResponse<void>> {
  try {
    const { itemId, tagId } = addTagToItemSchema.parse(input)

    await db.insert(itemTag).values({ itemId, tagId })

    revalidatePath("/items")
    revalidatePath(`/items/${itemId}`)
    revalidatePath("/tags")
    revalidatePath(`/tags/${tagId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error adding tag to item:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add tag to item",
    }
  }
}

export async function removeTagFromItem(
  input: RemoveTagFromItemInput
): Promise<ActionResponse<void>> {
  try {
    const { itemId, tagId } = removeTagFromItemSchema.parse(input)

    await db
      .delete(itemTag)
      .where(and(eq(itemTag.itemId, itemId), eq(itemTag.tagId, tagId)))

    revalidatePath("/items")
    revalidatePath(`/items/${itemId}`)
    revalidatePath("/tags")
    revalidatePath(`/tags/${tagId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error removing tag from item:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove tag from item",
    }
  }
}
