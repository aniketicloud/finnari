import { getItems } from "@/lib/models/item"
import { getLocations } from "@/lib/models/location"
import { ReminderForm } from "../_components/reminder-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function NewReminderPage() {
  const [allItems, locations] = await Promise.all([getItems(), getLocations()])

  const items = allItems
    .filter((item) => item.name !== null)
    .map((item) => ({
      id: item.id,
      name: item.name as string,
    }))

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/reminders">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Reminder</h1>
          <p className="text-muted-foreground">Create a reminder for an item</p>
        </div>
      </div>

      <ReminderForm items={items} locations={locations} />
    </div>
  )
}
