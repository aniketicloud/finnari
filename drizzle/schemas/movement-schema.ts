import { pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { item } from "./item-schema"
import { location } from "./location-schema"

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

// ==================== RELATIONS ====================
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

// ==================== TYPESCRIPT TYPES ====================
export type ItemMovement = typeof itemMovement.$inferSelect
export type NewItemMovement = typeof itemMovement.$inferInsert
