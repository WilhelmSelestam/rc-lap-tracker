"use client"

import { ColumnDef } from "@tanstack/react-table"

export type LapTime = {
  lapTimeMs: number
  carName: string
  driverName: string
}

export const columns: ColumnDef<LapTime>[] = [
  {
    accessorKey: "lapTimeMs",
    header: "Lap Time (ms)",
  },
  // {
  //   accessorKey: "carName",
  //   header: "Car Name",
  // },
  {
    accessorKey: "driverName",
    header: "Driver",
  },
]
