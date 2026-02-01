import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { item } from "./item-schema"
import { itemMovement } from "./movement-schema"
import { reminder } from "./reminder-schema"

// ==================== LOCATION ====================
export const location = pgTable("location", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==================== RELATIONS ====================
export const locationRelations = relations(location, ({ many }) => ({
  items: many(item),
  movementsFrom: many(itemMovement, { relationName: "fromLocation" }),
  movementsTo: many(itemMovement, { relationName: "toLocation" }),
  remindersFrom: many(reminder, { relationName: "reminderFromLocation" }),
  remindersTo: many(reminder, { relationName: "reminderToLocation" }),
}))

// ==================== TYPESCRIPT TYPES ====================
export type Location = typeof location.$inferSelect
export type NewLocation = typeof location.$inferInsert
