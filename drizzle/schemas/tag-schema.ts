import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { item } from "./item-schema"

// ==================== TAG ====================
export const tag = pgTable("tag", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==================== ITEM_TAG (Many-to-Many) ====================
export const itemTag = pgTable(
  "item_tag",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => item.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.tagId] })]
)

// ==================== RELATIONS ====================
export const tagRelations = relations(tag, ({ many }) => ({
  itemTags: many(itemTag),
}))

export const itemTagRelations = relations(itemTag, ({ one }) => ({
  item: one(item, {
    fields: [itemTag.itemId],
    references: [item.id],
  }),
  tag: one(tag, {
    fields: [itemTag.tagId],
    references: [tag.id],
  }),
}))

// ==================== TYPESCRIPT TYPES ====================
export type Tag = typeof tag.$inferSelect
export type NewTag = typeof tag.$inferInsert

export type ItemTag = typeof itemTag.$inferSelect
export type NewItemTag = typeof itemTag.$inferInsert
