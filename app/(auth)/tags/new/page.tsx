import { TagForm } from "../_components/tag-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function NewTagPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/tags">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Tag</h1>
          <p className="text-muted-foreground">
            Create a new tag for categorizing items
          </p>
        </div>
      </div>

      <TagForm />
    </div>
  )
}
