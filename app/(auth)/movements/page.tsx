import { getMovements } from "@/lib/models/movement"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

export default async function MovementsPage() {
  const movements = await getMovements({ limit: 100 })

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-3xl font-bold">Movement History</h1>
        <p className="text-muted-foreground">Track all item location changes</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>From</TableHead>
              <TableHead></TableHead>
              <TableHead>To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground text-center"
                >
                  No movement history found. Move items between locations to see
                  history here.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">
                    {movement.item?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {movement.fromLocation?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-center">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    {movement.toLocation?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {new Date(movement.movedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {movement.item && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/items/${movement.item.id}`}>
                          View Item
                        </Link>
                      </Button>
                    )}
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
