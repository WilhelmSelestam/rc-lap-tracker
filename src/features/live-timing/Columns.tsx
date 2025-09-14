"use client"

import { ColumnDef } from "@tanstack/react-table"

export type liveTimingTableData = {
  lapTimeMs: number
  recordedAt: string
  carId: number
}

export const columns: ColumnDef<liveTimingTableData>[] = [
  {
    accessorKey: "lapTimeMs",
    header: "Lap Time (ms)",
  },
  {
    accessorKey: "recordedAt",
    header: "Recorded At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("recordedAt"))
      const timeString = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      return <span>{timeString}</span>
    },
  },
  {
    accessorKey: "carId",
    header: "Car ID",
  },
]
