import { db } from "@/drizzle/db"
import { item } from "@/drizzle/schema"
import { eq, desc, and, ilike, or, sql } from "drizzle-orm"

export async function getItems(options?: {
  includeArchived?: boolean
  categoryId?: string
  locationId?: string
  search?: string
}) {
  try {
    const conditions = []

    if (!options?.includeArchived) {
      conditions.push(eq(item.isArchived, false))
    }

    if (options?.categoryId) {
      conditions.push(eq(item.categoryId, options.categoryId))
    }

    if (options?.locationId) {
      conditions.push(eq(item.locationId, options.locationId))
    }

    if (options?.search) {
      conditions.push(
        or(
          ilike(item.name, `%${options.search}%`),
          ilike(item.notes, `%${options.search}%`)
        )
      )
    }

    const items = await db.query.item.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        category: true,
        location: true,
      },
      orderBy: [desc(item.createdAt)],
    })

    return items
  } catch (error) {
    console.error("Error fetching items:", error)
    return []
  }
}

export async function getItemById(itemId: string) {
  try {
    const itemData = await db.query.item.findFirst({
      where: eq(item.id, itemId),
      with: {
        category: true,
        location: true,
        photos: {
          orderBy: (photos, { desc }) => [desc(photos.uploadedAt)],
        },
        itemTags: {
          with: {
            tag: true,
          },
        },
        movements: {
          with: {
            fromLocation: true,
            toLocation: true,
          },
          orderBy: (movements, { desc }) => [desc(movements.movedAt)],
          limit: 10,
        },
        reminders: {
          orderBy: (reminders, { asc, desc }) => [
            asc(reminders.status),
            desc(reminders.dueDate),
          ],
        },
      },
    })

    return itemData
  } catch (error) {
    console.error("Error fetching item by id:", error)
    return null
  }
}

export async function getArchivedItems() {
  try {
    const archivedItems = await db.query.item.findMany({
      where: eq(item.isArchived, true),
      with: {
        category: true,
        location: true,
      },
      orderBy: [desc(item.createdAt)],
    })

    return archivedItems
  } catch (error) {
    console.error("Error fetching archived items:", error)
    return []
  }
}

export async function getItemStats() {
  try {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        archived: sql<number>`count(*) filter (where ${item.isArchived} = true)`,
        active: sql<number>`count(*) filter (where ${item.isArchived} = false)`,
      })
      .from(item)

    return stats
  } catch (error) {
    console.error("Error fetching item stats:", error)
    return { total: 0, archived: 0, active: 0 }
  }
}
