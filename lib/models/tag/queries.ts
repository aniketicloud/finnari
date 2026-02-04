import { db } from "@/drizzle/db"
import { tag, itemTag } from "@/drizzle/schema"
import { eq, sql } from "drizzle-orm"

export async function getTags() {
  try {
    const tags = await db.query.tag.findMany({
      orderBy: [tag.name],
    })

    return tags
  } catch (error) {
    console.error("Error fetching tags:", error)
    return []
  }
}

export async function getTagById(tagId: string) {
  try {
    const tagData = await db.query.tag.findFirst({
      where: eq(tag.id, tagId),
      with: {
        itemTags: {
          with: {
            item: {
              with: {
                location: true,
                category: true,
              },
            },
          },
        },
      },
    })

    return tagData
  } catch (error) {
    console.error("Error fetching tag by id:", error)
    return null
  }
}

export async function getTagsWithItemCount() {
  try {
    const tagsWithCount = await db
      .select({
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
        itemCount: sql<number>`count(DISTINCT ${itemTag.itemId})`,
      })
      .from(tag)
      .leftJoin(itemTag, eq(itemTag.tagId, tag.id))
      .groupBy(tag.id, tag.name, tag.createdAt)
      .orderBy(tag.name)

    return tagsWithCount
  } catch (error) {
    console.error("Error fetching tags with item count:", error)
    return []
  }
}

export async function getItemTags(itemId: string) {
  try {
    const tags = await db.query.itemTag.findMany({
      where: eq(itemTag.itemId, itemId),
      with: {
        tag: true,
      },
    })

    return tags.map((it) => it.tag)
  } catch (error) {
    console.error("Error fetching item tags:", error)
    return []
  }
}
