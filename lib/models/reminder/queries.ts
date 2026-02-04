import { db } from "@/drizzle/db"
import { reminder } from "@/drizzle/schema"
import { eq, and, lte, gte, desc, asc } from "drizzle-orm"

export async function getReminders(options?: {
  status?: "pending" | "completed"
  itemId?: string
}) {
  try {
    const conditions = []

    if (options?.status) {
      conditions.push(eq(reminder.status, options.status))
    }

    if (options?.itemId) {
      conditions.push(eq(reminder.itemId, options.itemId))
    }

    const reminders = await db.query.reminder.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        item: {
          with: {
            location: true,
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [asc(reminder.status), desc(reminder.dueDate)],
    })

    return reminders
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return []
  }
}

export async function getReminderById(reminderId: string) {
  try {
    const reminderData = await db.query.reminder.findFirst({
      where: eq(reminder.id, reminderId),
      with: {
        item: {
          with: {
            location: true,
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
    })

    return reminderData
  } catch (error) {
    console.error("Error fetching reminder by id:", error)
    return null
  }
}

export async function getPendingReminders() {
  try {
    const pendingReminders = await db.query.reminder.findMany({
      where: eq(reminder.status, "pending"),
      with: {
        item: {
          with: {
            location: true,
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [asc(reminder.dueDate)],
    })

    return pendingReminders
  } catch (error) {
    console.error("Error fetching pending reminders:", error)
    return []
  }
}

export async function getOverdueReminders() {
  try {
    const now = new Date()
    const overdueReminders = await db.query.reminder.findMany({
      where: and(eq(reminder.status, "pending"), lte(reminder.dueDate, now)),
      with: {
        item: {
          with: {
            location: true,
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [asc(reminder.dueDate)],
    })

    return overdueReminders
  } catch (error) {
    console.error("Error fetching overdue reminders:", error)
    return []
  }
}

export async function getUpcomingReminders(daysAhead: number = 7) {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const upcomingReminders = await db.query.reminder.findMany({
      where: and(
        eq(reminder.status, "pending"),
        gte(reminder.dueDate, now),
        lte(reminder.dueDate, futureDate)
      ),
      with: {
        item: {
          with: {
            location: true,
            category: true,
          },
        },
        fromLocation: true,
        toLocation: true,
      },
      orderBy: [asc(reminder.dueDate)],
    })

    return upcomingReminders
  } catch (error) {
    console.error("Error fetching upcoming reminders:", error)
    return []
  }
}
