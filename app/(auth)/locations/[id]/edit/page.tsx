import { getLocationById } from "@/lib/models/location"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { LocationForm } from "../../_components/location-form"

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const location = await getLocationById(id)

  if (!location) {
    notFound()
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/locations/${id}`}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Location</h1>
          <p className="text-muted-foreground">Update location details</p>
        </div>
      </div>

      <LocationForm initialData={{ id: location.id, name: location.name }} />
    </div>
  )
}
