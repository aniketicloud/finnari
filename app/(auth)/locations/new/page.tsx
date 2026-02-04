import { LocationForm } from "../_components/location-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function NewLocationPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/locations">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Location</h1>
          <p className="text-muted-foreground">Add a new storage location</p>
        </div>
      </div>

      <LocationForm />
    </div>
  )
}
