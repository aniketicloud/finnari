import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  type PgColumn,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { item } from "./item-schema"

// ==================== CATEGORY ====================
export const category = pgTable(
  "category",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    parentCategoryId: uuid("parent_category_id").references(
      (): PgColumn => category.id,
      { onDelete: "cascade" }
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("category_parent_id_idx").on(table.parentCategoryId)]
)

// ==================== RELATIONS ====================
export const categoryRelations = relations(category, ({ one, many }) => ({
  parentCategory: one(category, {
    fields: [category.parentCategoryId],
    references: [category.id],
    relationName: "categoryHierarchy",
  }),
  subcategories: many(category, { relationName: "categoryHierarchy" }),
  items: many(item),
}))

// ==================== TYPESCRIPT TYPES ====================
export type Category = typeof category.$inferSelect
export type NewCategory = typeof category.$inferInsert
