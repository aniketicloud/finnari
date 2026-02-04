"use server"

import { db } from "@/drizzle/db"
import { category } from "@/drizzle/schema"
import type { CreateCategoryInput, UpdateCategoryInput } from "./validations"
import { createCategorySchema, updateCategorySchema } from "./validations"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createCategory(
  input: CreateCategoryInput
): Promise<ActionResponse<typeof category.$inferSelect>> {
  try {
    const validated = createCategorySchema.parse(input)

    const [newCategory] = await db
      .insert(category)
      .values(validated)
      .returning()

    revalidatePath("/categories")
    return { success: true, data: newCategory }
  } catch (error) {
    console.error("Error creating category:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create category",
    }
  }
}

export async function updateCategory(
  input: UpdateCategoryInput
): Promise<ActionResponse<typeof category.$inferSelect>> {
  try {
    const { id, ...data } = updateCategorySchema.parse(input)

    const [updatedCategory] = await db
      .update(category)
      .set(data)
      .where(eq(category.id, id))
      .returning()

    if (!updatedCategory) {
      return { success: false, error: "Category not found" }
    }

    revalidatePath("/categories")
    revalidatePath(`/categories/${id}`)
    return { success: true, data: updatedCategory }
  } catch (error) {
    console.error("Error updating category:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    }
  }
}

export async function deleteCategory(
  categoryId: string
): Promise<ActionResponse<void>> {
  try {
    const [deletedCategory] = await db
      .delete(category)
      .where(eq(category.id, categoryId))
      .returning()

    if (!deletedCategory) {
      return { success: false, error: "Category not found" }
    }

    revalidatePath("/categories")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error deleting category:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    }
  }
}
