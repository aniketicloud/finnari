import { getCategories } from "@/lib/models/category"
import { CategoryForm } from "../_components/category-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function NewCategoryPage() {
  const categories = await getCategories()

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/categories">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Category</h1>
          <p className="text-muted-foreground">
            Add a new category for organizing items
          </p>
        </div>
      </div>

      <CategoryForm categories={categories} />
    </div>
  )
}
