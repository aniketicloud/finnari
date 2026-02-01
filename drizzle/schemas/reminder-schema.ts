import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { item } from "./item-schema"
import { location } from "./location-schema"

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
export type Reminder = typeof reminder.$inferSelect
export type NewReminder = typeof reminder.$inferInsert
