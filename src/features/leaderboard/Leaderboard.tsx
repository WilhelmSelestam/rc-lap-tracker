"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "../../../utils/supabase/client"
import { columns, LapTime } from "./Columns"
import { DataTable } from "@/components/DataTable"
import { OptionSelector } from "../live-timing/SelectOption"
import { useState } from "react"
import { getCars } from "./api/getCars"

export const fetchLeaderboard = async (
  driverName: string,
  carName: string
): Promise<LapTime[]> => {
  const supabase = createClient()
  let query = supabase
    .from("laptimes")
    .select(
      `
      lapTimeMs: lap_time_ms,
      cars!inner (
        carName: car_name,
        driverName: driver_name
      )
    `
    )
    .order("lap_time_ms", { ascending: true })

  if (driverName !== "All") {
    query = query.eq("cars.driver_name", driverName)
  }

  if (carName !== "All") {
    query = query.eq("cars.car_name", carName)
  }

  const { data, error } = await query.limit(10)

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

type LeaderboardProps = {
  drivers: string[]
}

export default function Leaderboard({ drivers }: LeaderboardProps) {
  const [selectedDriver, setSelectedDriver] = useState("All")
  const [selectedCar, setSelectedCar] = useState("All")

  const {
    data: leaderboardData,
    isLoading: isLeaderboardDataLoading,
    error: leaderboardDataError,
  } = useQuery<LapTime[]>({
    queryKey: ["laptimes", "leaderboard", selectedDriver, selectedCar],
    queryFn: () => fetchLeaderboard(selectedDriver, selectedCar),
  })

  const {
    data: carsData,
    isLoading: isCarsDataLoading,
    error: carsDataError,
  } = useQuery<string[]>({
    queryKey: ["cars", "leaderboard", selectedDriver],
    queryFn: () => getCars(selectedDriver),
  })

  if (isLeaderboardDataLoading || isCarsDataLoading)
    return <span>Loading...</span>
  if (leaderboardDataError)
    return <span>Error: {(leaderboardDataError as Error).message}</span>
  if (carsDataError)
    return <span>Error: {(carsDataError as Error).message}</span>

  // console.log("carsData", carsData)
  // console.log("leaderboardData", leaderboardData)
  // console.log("selectedDriver", selectedDriver)
  // console.log("selectedCar", selectedCar)

  return (
    <>
      <h1 className="flex text-3xl font-bold mb-4 justify-center mt-10">
        Leaderboard
      </h1>
      <div className="flex flex-row justify-center gap-x-4">
        <OptionSelector
          label="Driver"
          options={["All", ...drivers]}
          selectedOption={selectedDriver}
          setSelectedOption={setSelectedDriver}
        />
        <OptionSelector
          label="Car"
          options={["All", ...(carsData ?? [])]}
          selectedOption={selectedCar}
          setSelectedOption={setSelectedCar}
        />
      </div>
      <div className="container mx-auto py-10 max-w-8/9">
        <DataTable columns={columns} data={leaderboardData ?? []} />
      </div>
    </>
  )
}
