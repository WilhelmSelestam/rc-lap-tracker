"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "../../../utils/supabase/client"
import { columns, LapTime } from "./Columns"
import { DataTable } from "@/components/DataTable"

export const fetchLeaderboard = async (): Promise<LapTime[]> => {
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
    .order("lap_time_ms", { ascending: true })
    .limit(10)

  if (error) {
    throw new Error(error.message)
  }

  const flattenedData = data.map((lap: any) => ({
    lapTimeMs: lap.lapTimeMs,
    carName: lap.cars?.carName ?? "N/A",
    driverName: lap.cars?.driverName ?? "Unknown Driver",
  }))

  return flattenedData
}

export default function Leaderboard() {
  const {
    data: leaderboardData,
    isLoading,
    error,
  } = useQuery<LapTime[]>({
    queryKey: ["laptimes", "leaderboard"],
    queryFn: fetchLeaderboard,
  })

  if (isLoading) return <span>Loading...</span>
  if (error) return <span>Error: {(error as Error).message}</span>

  return (
    <>
      <h1 className="flex text-3xl font-bold mb-4 justify-center mt-10">
        Leaderboard
      </h1>
      <div className="container mx-auto py-10 max-w-8/9">
        <DataTable columns={columns} data={leaderboardData ?? []} />
      </div>
    </>
  )
}
