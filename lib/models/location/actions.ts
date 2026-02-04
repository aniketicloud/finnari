"use server"

import { db } from "@/drizzle/db"
import { location } from "@/drizzle/schema"
import type { CreateLocationInput, UpdateLocationInput } from "./validations"
import { createLocationSchema, updateLocationSchema } from "./validations"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createLocation(
  input: CreateLocationInput
): Promise<ActionResponse<typeof location.$inferSelect>> {
  try {
    const validated = createLocationSchema.parse(input)

    const [newLocation] = await db
      .insert(location)
      .values(validated)
      .returning()

    revalidatePath("/locations")
    return { success: true, data: newLocation }
  } catch (error) {
    console.error("Error creating location:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create location",
    }
  }
}

export async function updateLocation(
  input: UpdateLocationInput
): Promise<ActionResponse<typeof location.$inferSelect>> {
  try {
    const { id, ...data } = updateLocationSchema.parse(input)

    const [updatedLocation] = await db
      .update(location)
      .set(data)
      .where(eq(location.id, id))
      .returning()

    if (!updatedLocation) {
      return { success: false, error: "Location not found" }
    }

    revalidatePath("/locations")
    revalidatePath(`/locations/${id}`)
    return { success: true, data: updatedLocation }
  } catch (error) {
    console.error("Error updating location:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update location",
    }
  }
}

export async function deleteLocation(
  locationId: string
): Promise<ActionResponse<void>> {
  try {
    const [deletedLocation] = await db
      .delete(location)
      .where(eq(location.id, locationId))
      .returning()

    if (!deletedLocation) {
      return { success: false, error: "Location not found" }
    }

    revalidatePath("/locations")
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Error deleting location:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete location",
    }
  }
}
