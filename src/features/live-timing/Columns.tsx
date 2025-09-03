"use client"

import { ColumnDef } from "@tanstack/react-table"

export type liveTimingData = {
  lapTimeMs: number
  recordedAt: string
}

export const columns: ColumnDef<liveTimingData>[] = [
  {
    accessorKey: "lapTimeMs",
    header: "Lap Time (ms)",
  },
  {
    accessorKey: "recordedAt",
    header: "Recorded At",
  },
]
