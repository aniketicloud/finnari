import { getReminderById } from "@/lib/models/reminder"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ReminderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reminder = await getReminderById(id)

  if (!reminder) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/reminders">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Reminder</h1>
            <Badge
              variant={
                reminder.status === "completed" ? "default" : "secondary"
              }
            >
              {reminder.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Reminder details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Item</p>
              <p className="text-muted-foreground text-sm">
                {reminder.item?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-muted-foreground text-sm">
                {reminder.description || "No description"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">From Location</p>
              <p className="text-muted-foreground text-sm">
                {reminder.fromLocation?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">To Location</p>
              <p className="text-muted-foreground text-sm">
                {reminder.toLocation?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-muted-foreground text-sm">
                {reminder.dueDate
                  ? new Date(reminder.dueDate).toLocaleDateString()
                  : "No due date"}
              </p>
            </div>
            {reminder.completedAt && (
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(reminder.completedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-muted-foreground text-sm">
                {new Date(reminder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reminder.item && (
              <>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-muted-foreground text-sm">
                    {reminder.item.category?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-muted-foreground text-sm">
                    {reminder.item.location?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Quantity</p>
                  <p className="text-muted-foreground text-sm">
                    {reminder.item.quantity}
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/items/${reminder.item.id}`}>
                    View Item Details
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
