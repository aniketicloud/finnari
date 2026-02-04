import { db } from "@/drizzle/db"
import { location } from "@/drizzle/schema"
import { eq, sql } from "drizzle-orm"

export async function getLocations() {
  try {
    const locations = await db.query.location.findMany({
      orderBy: [location.name],
    })

    return locations
  } catch (error) {
    console.error("Error fetching locations:", error)
    return []
  }
}

export async function getLocationById(locationId: string) {
  try {
    const locationData = await db.query.location.findFirst({
      where: eq(location.id, locationId),
      with: {
        items: {
          where: (items, { eq }) => eq(items.isArchived, false),
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        },
      },
    })

    return locationData
  } catch (error) {
    console.error("Error fetching location by id:", error)
    return null
  }
}

export async function getLocationsWithItemCount() {
  try {
    const locationsWithCount = await db
      .select({
        id: location.id,
        name: location.name,
        createdAt: location.createdAt,
        itemCount: sql<number>`count(DISTINCT item.id)`,
      })
      .from(location)
      .leftJoin(
        sql`item`,
        sql`item.location_id = ${location.id} AND item.is_archived = false`
      )
      .groupBy(location.id, location.name, location.createdAt)
      .orderBy(location.name)

    return locationsWithCount
  } catch (error) {
    console.error("Error fetching locations with item count:", error)
    return []
  }
}
