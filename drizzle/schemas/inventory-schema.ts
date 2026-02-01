// schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  index,
  type PgColumn,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ==================== LOCATION ====================
export const location = pgTable("location", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

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

// ==================== ITEM_MOVEMENT (History) ====================
export const itemMovement = pgTable(
  "item_movement",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => item.id, { onDelete: "cascade" }),
    fromLocationId: uuid("from_location_id").references(() => location.id, {
      onDelete: "set null",
    }),
    toLocationId: uuid("to_location_id").references(() => location.id, {
      onDelete: "set null",
    }),
    movedAt: timestamp("moved_at").defaultNow().notNull(),
  },
  (table) => [
    index("item_movement_item_id_idx").on(table.itemId),
    index("item_movement_moved_at_idx").on(table.movedAt),
  ]
)

// ==================== REMINDER ====================
export const reminder = pgTable(
  "reminder",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => item.id, { onDelete: "cascade" }),
    fromLocationId: uuid("from_location_id").references(() => location.id, {
      onDelete: "set null",
    }),
    toLocationId: uuid("to_location_id").references(() => location.id, {
      onDelete: "set null",
    }),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("reminder_item_id_idx").on(table.itemId),
    index("reminder_status_idx").on(table.status),
  ]
)

// ==================== RELATIONS ====================

export const locationRelations = relations(location, ({ many }) => ({
  items: many(item),
  movementsFrom: many(itemMovement, { relationName: "fromLocation" }),
  movementsTo: many(itemMovement, { relationName: "toLocation" }),
  remindersFrom: many(reminder, { relationName: "reminderFromLocation" }),
  remindersTo: many(reminder, { relationName: "reminderToLocation" }),
}))

export const categoryRelations = relations(category, ({ one, many }) => ({
  parentCategory: one(category, {
    fields: [category.parentCategoryId],
    references: [category.id],
    relationName: "categoryHierarchy",
  }),
  subcategories: many(category, { relationName: "categoryHierarchy" }),
  items: many(item),
}))

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

export const itemMovementRelations = relations(itemMovement, ({ one }) => ({
  item: one(item, {
    fields: [itemMovement.itemId],
    references: [item.id],
  }),
  fromLocation: one(location, {
    fields: [itemMovement.fromLocationId],
    references: [location.id],
    relationName: "fromLocation",
  }),
  toLocation: one(location, {
    fields: [itemMovement.toLocationId],
    references: [location.id],
    relationName: "toLocation",
  }),
}))

export const reminderRelations = relations(reminder, ({ one }) => ({
  item: one(item, {
    fields: [reminder.itemId],
    references: [item.id],
  }),
  fromLocation: one(location, {
    fields: [reminder.fromLocationId],
    references: [location.id],
    relationName: "reminderFromLocation",
  }),
  toLocation: one(location, {
    fields: [reminder.toLocationId],
    references: [location.id],
    relationName: "reminderToLocation",
  }),
}))

// ==================== TYPESCRIPT TYPES ====================

export type Location = typeof location.$inferSelect
export type NewLocation = typeof location.$inferInsert

export type Category = typeof category.$inferSelect
export type NewCategory = typeof category.$inferInsert

export type Item = typeof item.$inferSelect
export type NewItem = typeof item.$inferInsert

export type ItemPhoto = typeof itemPhoto.$inferSelect
export type NewItemPhoto = typeof itemPhoto.$inferInsert

export type Tag = typeof tag.$inferSelect
export type NewTag = typeof tag.$inferInsert

export type ItemTag = typeof itemTag.$inferSelect
export type NewItemTag = typeof itemTag.$inferInsert

export type ItemMovement = typeof itemMovement.$inferSelect
export type NewItemMovement = typeof itemMovement.$inferInsert

export type Reminder = typeof reminder.$inferSelect
export type NewReminder = typeof reminder.$inferInsert
