import { db } from "@/drizzle/db"
import { itemMovement } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"

export async function getMovements(options?: {
  itemId?: string
  limit?: number
}) {
  try {
    const movements = await db.query.itemMovement.findMany({
      where: options?.itemId
        ? eq(itemMovement.itemId, options.itemId)
        : undefined,
      with: {
        item: {
          with: {
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [desc(itemMovement.movedAt)],
      limit: options?.limit,
    })

    return movements
  } catch (error) {
    console.error("Error fetching movements:", error)
    return []
  }
}

export async function getMovementById(movementId: string) {
  try {
    const movement = await db.query.itemMovement.findFirst({
      where: eq(itemMovement.id, movementId),
      with: {
        item: {
          with: {
            category: true,
            location: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
    })

    return movement
  } catch (error) {
    console.error("Error fetching movement by id:", error)
    return null
  }
}

export async function getItemMovementHistory(itemId: string) {
  try {
    const movements = await db.query.itemMovement.findMany({
      where: eq(itemMovement.itemId, itemId),
      with: {
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [desc(itemMovement.movedAt)],
    })

    return movements
  } catch (error) {
    console.error("Error fetching item movement history:", error)
    return []
  }
}

export async function getRecentMovements(limit: number = 10) {
  try {
    const movements = await db.query.itemMovement.findMany({
      with: {
        item: {
          with: {
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [desc(itemMovement.movedAt)],
      limit,
    })

    return movements
  } catch (error) {
    console.error("Error fetching recent movements:", error)
    return []
  }
}
