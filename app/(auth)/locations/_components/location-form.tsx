"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createLocationSchema,
  updateLocationSchema,
  type CreateLocationInput,
  type UpdateLocationInput,
} from "@/lib/models/location/validations"
import { createLocation, updateLocation } from "@/lib/models/location/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type Props = {
  initialData?: { id: string; name: string }
}

export function LocationForm({ initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLocationInput | UpdateLocationInput>({
    resolver: zodResolver(
      isEditing ? updateLocationSchema : createLocationSchema
    ),
    defaultValues: initialData ?? { name: "" },
  })

  const onSubmit = (data: CreateLocationInput | UpdateLocationInput) => {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateLocation({
          ...data,
          id: initialData.id,
        } as UpdateLocationInput)
        if (result.success) {
          toast.success("Location updated successfully")
          router.push(`/locations/${initialData.id}`)
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createLocation(data as CreateLocationInput)
        if (result.success) {
          toast.success("Location created successfully")
          router.push("/locations")
        } else {
          toast.error(result.error)
        }
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Location" : "Create New Location"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Location name"
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Location"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
