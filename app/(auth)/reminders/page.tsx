import { getReminders } from "@/lib/models/reminder"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function RemindersPage() {
  const reminders = await getReminders()

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">
            Track items that need to be moved or managed
          </p>
        </div>
        <Button asChild>
          <Link href="/reminders/new">
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
            Add Reminder
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reminders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No reminders found. Create your first reminder to get started.
                </TableCell>
              </TableRow>
            ) : (
              reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell className="font-medium">
                    {reminder.item?.name || "-"}
                  </TableCell>
                  <TableCell>{reminder.description || "-"}</TableCell>
                  <TableCell>
                    {reminder.dueDate
                      ? new Date(reminder.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reminder.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {reminder.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/reminders/${reminder.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
