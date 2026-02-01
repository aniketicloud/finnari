import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { category } from "./category-schema"
import { location } from "./location-schema"
import { itemTag } from "./tag-schema"
import { itemMovement } from "./movement-schema"
import { reminder } from "./reminder-schema"

// ==================== ITEM ====================
export const item = pgTable(
  "item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    locationId: uuid("location_id").references(() => location.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").default(1),
    notes: text("notes"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("item_category_id_idx").on(table.categoryId),
    index("item_location_id_idx").on(table.locationId),
    index("item_is_archived_idx").on(table.isArchived),
  ]
)

// ==================== ITEM_PHOTO ====================
export const itemPhoto = pgTable(
  "item_photo",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => item.id, { onDelete: "cascade" }),
    photoUrl: varchar("photo_url", { length: 500 }).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (table) => [index("item_photo_item_id_idx").on(table.itemId)]
)

// ==================== RELATIONS ====================
export const itemRelations = relations(item, ({ one, many }) => ({
  category: one(category, {
    fields: [item.categoryId],
    references: [category.id],
  }),
  location: one(location, {
    fields: [item.locationId],
    references: [location.id],
  }),
  photos: many(itemPhoto),
  itemTags: many(itemTag),
  movements: many(itemMovement),
  reminders: many(reminder),
}))

export const itemPhotoRelations = relations(itemPhoto, ({ one }) => ({
  item: one(item, {
    fields: [itemPhoto.itemId],
    references: [item.id],
  }),
}))

// ==================== TYPESCRIPT TYPES ====================
export type Item = typeof item.$inferSelect
export type NewItem = typeof item.$inferInsert

export type ItemPhoto = typeof itemPhoto.$inferSelect
export type NewItemPhoto = typeof itemPhoto.$inferInsert
