"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "../../../utils/supabase/client"
import { columns, liveTimingData } from "./Columns"
import { DataTable } from "@/components/DataTable"
import { SelectDriverDropdown } from "./SelectDriverDropdown"
import { useState } from "react"

export const fetchData = async (driver: string): Promise<liveTimingData[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("laptimes")
    .select(
      `
      lapTimeMs: lap_time_ms,
      cars (
        carName: car_name,
        driverName: driver_name
      )
    `
    )
    .eq("cars.driver_name", driver)
    .order("lap_time_ms", { ascending: true })
    .limit(10)

  if (error) {
    throw new Error(error.message)
  }

  const flattenedData = data.map((lap: any) => ({
    lapTimeMs: lap.lapTimeMs,
    time: lap.cars.driverName,
  }))

  return flattenedData
}

type TimeTableProps = {
  drivers: string[]
}

export default function TimeTable({ drivers }: TimeTableProps) {
  const [selectedDriver, setSelectedDriver] = useState(drivers[0])

  const {
    data: data,
    isLoading,
    isError,
    error,
  } = useQuery<liveTimingData[]>({
    queryKey: ["laptimes", "liveTiming"],
    queryFn: () => fetchData(selectedDriver),
  })

  if (isLoading) return <span>Loading...</span>
  if (isError) return <span>Error: {(error as Error).message}</span>

  return (
    <>
      <h1 className="flex text-3xl font-bold mb-4 justify-center mt-10">
        Live-timing
      </h1>
      <SelectDriverDropdown
        drivers={drivers}
        selectedDriver={selectedDriver}
        setSelectedDriver={setSelectedDriver}
      />
      <div className="container mx-auto py-10 max-w-8/9">
        <DataTable columns={columns} data={data ?? []} />
      </div>
    </>
  )
}
