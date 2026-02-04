import { getItemById } from "@/lib/models/item"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/items">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            {item.isArchived && <Badge variant="secondary">Archived</Badge>}
          </div>
          <p className="text-muted-foreground">Item details and history</p>
        </div>
        <Button asChild>
          <Link href={`/items/${id}/edit`}>Edit</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Category</p>
              <p className="text-muted-foreground text-sm">
                {item.category?.name || "No category"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-muted-foreground text-sm">
                {item.location?.name || "No location"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Quantity</p>
              <p className="text-muted-foreground text-sm">{item.quantity}</p>
            </div>
            {item.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-muted-foreground text-sm">{item.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.itemTags && item.itemTags.length > 0 ? (
                  item.itemTags.map((itemTag) => (
                    <Badge key={itemTag.tag.id} variant="outline">
                      {itemTag.tag.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No tags</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {item.photos && item.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {item.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-muted aspect-square rounded-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No photos uploaded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {item.movements && item.movements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movement History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{movement.fromLocation?.name || "-"}</TableCell>
                    <TableCell>{movement.toLocation?.name || "-"}</TableCell>
                    <TableCell>
                      {new Date(movement.movedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {item.reminders && item.reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
