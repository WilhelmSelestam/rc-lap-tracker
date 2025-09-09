"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "../../../utils/supabase/client"
import { columns, liveTimingData } from "./Columns"
import { DataTable } from "@/components/DataTable"
import { SelectDriverDropdown } from "./SelectDriverDropdown"
import { useState } from "react"
import { fetchLiveTimingData, getLapTimesByDriver } from "./api/getLapTimes"
import { Select } from "@radix-ui/react-select"
import { OptionSelector } from "./SelectOption"

export const fetchData = async (driver: string): Promise<liveTimingData[]> => {
  const supabase = createClient()

  let query = supabase.from("laptimes").select(
    `
      lapTimeMs: lap_time_ms,
      recordedAt: recorded_at,
      cars!inner (
        driverName: driver_name
      )
    `
  )

  if (driver !== "All") {
    query = query.eq("cars.driver_name", driver)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    throw new Error(error.message)
  }

  const flattenedData = data.map((lap: any) => ({
    lapTimeMs: lap.lapTimeMs,
    recordedAt: lap.recordedAt,
  }))

  return flattenedData
}

type TimeTableProps = {
  drivers: string[]
}

export default function TimeTable({ drivers }: TimeTableProps) {
  const [selectedDriver, setSelectedDriver] = useState("All")

  const {
    data: data,
    isLoading,
    isError,
    error,
  } = useQuery<liveTimingData[]>({
    queryKey: ["laptimes", "liveTiming", selectedDriver],
    queryFn: () => fetchData(selectedDriver),
  })

  if (isLoading) return <span>Loading...</span>
  if (isError) return <span>Error: {(error as Error).message}</span>

  return (
    <>
      <h1 className="flex text-3xl font-bold mb-4 justify-center mt-10">
        Live-timing for {selectedDriver}
      </h1>
      <OptionSelector
        label="Driver"
        options={["All", ...drivers]}
        selectedOption={selectedDriver}
        setSelectedOption={setSelectedDriver}
      />
      <div className="my-5">
        <DataTable columns={columns} data={data ?? []} />
      </div>
    </>
  )
}
