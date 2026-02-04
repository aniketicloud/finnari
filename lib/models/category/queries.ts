import { db } from "@/drizzle/db"
import { category } from "@/drizzle/schema"
import { eq, isNull } from "drizzle-orm"

export async function getCategories() {
  try {
    const categories = await db.query.category.findMany({
      with: {
        parentCategory: true,
        subcategories: true,
      },
      orderBy: [category.name],
    })

    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getCategoryById(categoryId: string) {
  try {
    const categoryData = await db.query.category.findFirst({
      where: eq(category.id, categoryId),
      with: {
        parentCategory: true,
        subcategories: {
          orderBy: [category.name],
        },
        items: {
          where: (items, { eq }) => eq(items.isArchived, false),
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        },
      },
    })

    return categoryData
  } catch (error) {
    console.error("Error fetching category by id:", error)
    return null
  }
}

export async function getRootCategories() {
  try {
    const rootCategories = await db.query.category.findMany({
      where: isNull(category.parentCategoryId),
      with: {
        subcategories: {
          orderBy: [category.name],
        },
      },
      orderBy: [category.name],
    })

    return rootCategories
  } catch (error) {
    console.error("Error fetching root categories:", error)
    return []
  }
}

export async function getCategoryHierarchy() {
  try {
    const allCategories = await db.query.category.findMany({
      with: {
        parentCategory: true,
        subcategories: true,
      },
      orderBy: [category.name],
    })

    // Build hierarchy structure
    const categoryMap = new Map(
      allCategories.map((cat) => [
        cat.id,
        { ...cat, children: [] as typeof allCategories },
      ])
    )
    const roots: typeof allCategories = []

    for (const cat of allCategories) {
      if (cat.parentCategoryId) {
        const parent = categoryMap.get(cat.parentCategoryId)
        if (parent) {
          parent.children.push(cat)
        }
      } else {
        roots.push(cat)
      }
    }

    return roots
  } catch (error) {
    console.error("Error building category hierarchy:", error)
    return []
  }
}
