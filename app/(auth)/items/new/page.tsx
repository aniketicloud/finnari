import { getCategories } from "@/lib/models/category"
import { getLocations } from "@/lib/models/location"
import { ItemForm } from "../_components/item-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function NewItemPage() {
  const [categories, locations] = await Promise.all([
    getCategories(),
    getLocations(),
  ])

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/items">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Item</h1>
          <p className="text-muted-foreground">
            Add a new item to your inventory
          </p>
        </div>
      </div>

      <ItemForm categories={categories} locations={locations} />
    </div>
  )
}
