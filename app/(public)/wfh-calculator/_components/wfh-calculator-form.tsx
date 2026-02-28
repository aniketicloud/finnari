"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { wfhSchema } from "../validations/wfh-validation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"

type WfhFormData = z.infer<typeof wfhSchema>

interface WfhResult {
  officeHours: number
  officeMinutes: number
  officeIn: string
  officeOut: string
  remainingHours: number
  remainingMinutes: number
  wfhFrom: string
  wfhTo: string
  noWfhNeeded: boolean
  placement: "before" | "after"
  altCombinations: { gapLabel: string; from: string; to: string }[]
}

const DAY_START = 8 * 60 // 8:00 AM in minutes
const DAY_END = 20 * 60 // 8:00 PM in minutes

function toMinutes(h: number, m: number) {
  return h * 60 + m
}

function formatTime12(totalMinutes: number) {
  // Handle overflow past midnight
  const mins = ((totalMinutes % 1440) + 1440) % 1440
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const period = h >= 12 ? "PM" : "AM"
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:${m.toString().padStart(2, "0")} ${period}`
}

function padNum(n: number) {
  return n.toString().padStart(2, "0")
}

export function WfhCalculatorForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [result, setResult] = useState<WfhResult | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WfhFormData>({
    resolver: zodResolver(wfhSchema),
    defaultValues: {
      timeIn: "",
      timeOut: "",
      totalHours: 9,
      totalMinutes: 15,
      gapHours: 0,
      gapMinutes: 20,
    },
  })

  const onSubmit = (data: WfhFormData) => {
    const [inH, inM] = data.timeIn.split(":").map(Number)
    const [outH, outM] = data.timeOut.split(":").map(Number)

    // Cross-field validation: timeOut must be after timeIn
    if (toMinutes(outH, outM) <= toMinutes(inH, inM)) {
      setError("timeOut", { message: "Time Out must be after Time In" })
      setResult(null)
      return
    }

    const officeTotal = toMinutes(outH, outM) - toMinutes(inH, inM)
    const officeStartMin = toMinutes(inH, inM)
    const officeEndMin = toMinutes(outH, outM)
    const totalRequired = toMinutes(data.totalHours, data.totalMinutes)
    const gap = toMinutes(data.gapHours, data.gapMinutes)
    const remaining = totalRequired - officeTotal

    if (remaining <= 0) {
      setResult({
        officeHours: Math.floor(officeTotal / 60),
        officeMinutes: officeTotal % 60,
        officeIn: formatTime12(officeStartMin),
        officeOut: formatTime12(officeEndMin),
        remainingHours: 0,
        remainingMinutes: 0,
        wfhFrom: "",
        wfhTo: "",
        noWfhNeeded: true,
        placement: "after",
        altCombinations: [],
      })
      return
    }

    // Available time before office (8 AM to officeStart - gap)
    const availableBefore = officeStartMin - gap - DAY_START
    // Available time after office (officeEnd + gap to 8 PM)
    const availableAfter = DAY_END - (officeEndMin + gap)

    let wfhFromMin: number
    let wfhToMin: number
    let placement: "before" | "after"

    if (availableBefore >= remaining && availableBefore >= availableAfter) {
      // Place WFH BEFORE office
      placement = "before"
      wfhToMin = officeStartMin - gap
      wfhFromMin = wfhToMin - remaining
    } else {
      // Place WFH AFTER office
      placement = "after"
      wfhFromMin = officeEndMin + gap
      wfhToMin = wfhFromMin + remaining
    }

    // Compute two alternate combinations with +10 and +20 min gap
    const altCombinations: { gapLabel: string; from: string; to: string }[] = []
    for (const extraGap of [10, 20]) {
      const altGap = gap + extraGap
      const altGapH = Math.floor(altGap / 60)
      const altGapM = altGap % 60
      const gapLabel =
        altGapH > 0 ? `${altGapH}h ${padNum(altGapM)}m` : `${altGapM}m`
      let altFrom: number
      let altTo: number
      if (placement === "before") {
        altTo = officeStartMin - altGap
        altFrom = altTo - remaining
      } else {
        altFrom = officeEndMin + altGap
        altTo = altFrom + remaining
      }
      altCombinations.push({
        gapLabel,
        from: formatTime12(altFrom),
        to: formatTime12(altTo),
      })
    }

    setResult({
      officeHours: Math.floor(officeTotal / 60),
      officeMinutes: officeTotal % 60,
      officeIn: formatTime12(officeStartMin),
      officeOut: formatTime12(officeEndMin),
      remainingHours: Math.floor(remaining / 60),
      remainingMinutes: remaining % 60,
      wfhFrom: formatTime12(wfhFromMin),
      wfhTo: formatTime12(wfhToMin),
      noWfhNeeded: false,
      placement,
      altCombinations,
    })
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-stretch",
        className
      )}
      {...props}
    >
      <Card className="lg:flex-1">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            WFH Time Calculator
          </CardTitle>
          <CardDescription>
            Enter your office hours and total required work hours to calculate
            your Work From Home schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* Office Time In / Time Out */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="timeIn">Office Time In</FieldLabel>
                  <Input
                    id="timeIn"
                    type="time"
                    {...register("timeIn")}
                    aria-invalid={errors.timeIn ? "true" : "false"}
                  />
                  {errors.timeIn && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.timeIn.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="timeOut">Office Time Out</FieldLabel>
                  <Input
                    id="timeOut"
                    type="time"
                    {...register("timeOut")}
                    aria-invalid={errors.timeOut ? "true" : "false"}
                  />
                  {errors.timeOut && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.timeOut.message}
                    </p>
                  )}
                </Field>
              </div>

              <Separator />

              {/* Total Required Work Hours */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  Total Required Work Hours
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="totalHours">Hours</FieldLabel>
                    <Input
                      id="totalHours"
                      type="number"
                      min={0}
                      max={23}
                      placeholder="9"
                      {...register("totalHours", { valueAsNumber: true })}
                      aria-invalid={errors.totalHours ? "true" : "false"}
                    />
                    {errors.totalHours && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.totalHours.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="totalMinutes">Minutes</FieldLabel>
                    <Input
                      id="totalMinutes"
                      type="number"
                      min={0}
                      max={59}
                      placeholder="15"
                      {...register("totalMinutes", { valueAsNumber: true })}
                      aria-invalid={errors.totalMinutes ? "true" : "false"}
                    />
                    {errors.totalMinutes && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.totalMinutes.message}
                      </p>
                    )}
                  </Field>
                </div>
              </div>

              <Separator />

              {/* Commute / Gap */}
              <div>
                <p className="mb-1 text-sm font-medium">Commute / Gap</p>
                <p className="text-muted-foreground mb-2 text-xs">
                  Travel time between office and WFH (default: 20 min)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="gapHours">Hours</FieldLabel>
                    <Input
                      id="gapHours"
                      type="number"
                      min={0}
                      max={23}
                      placeholder="0"
                      {...register("gapHours", { valueAsNumber: true })}
                      aria-invalid={errors.gapHours ? "true" : "false"}
                    />
                    {errors.gapHours && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.gapHours.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="gapMinutes">Minutes</FieldLabel>
                    <Input
                      id="gapMinutes"
                      type="number"
                      min={0}
                      max={59}
                      placeholder="20"
                      {...register("gapMinutes", { valueAsNumber: true })}
                      aria-invalid={errors.gapMinutes ? "true" : "false"}
                    />
                    {errors.gapMinutes && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.gapMinutes.message}
                      </p>
                    )}
                  </Field>
                </div>
              </div>

              <Field>
                <Button type="submit" className="w-full">
                  Calculate WFH Time
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card
          className={cn(
            "border-2 lg:flex-1",
            result.noWfhNeeded ? "border-green-500/40" : "border-primary/40"
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {result.noWfhNeeded ? "No WFH Needed!" : "Your WFH Schedule"}
            </CardTitle>
            {result.noWfhNeeded && (
              <CardDescription>
                Your office hours already cover the full required work day.
              </CardDescription>
            )}
          </CardHeader>
          {!result.noWfhNeeded && (
            <CardContent>
              <div className="space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-muted-foreground text-xs">
                      Office Hours
                    </p>
                    <p className="text-lg font-semibold">
                      {result.officeHours}h {padNum(result.officeMinutes)}m
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {result.officeIn} – {result.officeOut}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-muted-foreground text-xs">
                      WFH Required
                    </p>
                    <p className="text-lg font-semibold">
                      {result.remainingHours}h {padNum(result.remainingMinutes)}
                      m
                    </p>
                  </div>
                </div>

                <Separator />

                {/* WFH From / To — the main output */}
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4">
                  <p className="text-muted-foreground mb-1 text-center text-xs font-medium uppercase tracking-wider">
                    Work From Home
                  </p>
                  <p className="text-muted-foreground mb-3 text-center text-xs">
                    {result.placement === "before"
                      ? "Before office hours"
                      : "After office hours"}
                  </p>
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">From</p>
                      <p className="text-primary text-xl font-bold sm:text-2xl">
                        {result.wfhFrom}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-lg">→</span>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">To</p>
                      <p className="text-primary text-xl font-bold sm:text-2xl">
                        {result.wfhTo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alt combinations with different gaps */}
                {result.altCombinations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-center text-xs">
                      Other gap options
                    </p>
                    {result.altCombinations.map((alt, i) => (
                      <div
                        key={i}
                        className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm"
                      >
                        <span className="text-muted-foreground text-xs">
                          {alt.gapLabel} gap
                        </span>
                        <span className="font-medium">
                          {alt.from} → {alt.to}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
