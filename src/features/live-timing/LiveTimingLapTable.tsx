"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "../../../utils/supabase/client"
import { columns, liveTimingTableData } from "./Columns"
import { DataTable } from "@/components/DataTable"
import { useEffect, useState } from "react"
import { OptionSelector } from "./SelectOption"
import { getCars } from "../leaderboard/api/getCars"
import { CarInfo } from "../leaderboard/api/getCars"

export const fetchData = async (
  driver: string
): Promise<liveTimingTableData[]> => {
  const supabase = createClient()

  let query = supabase.from("laptimes").select(
    `
      lapTimeMs: lap_time_ms,
      recordedAt: recorded_at,
      carId: car_id,
      cars!inner (
        driverName: driver_name
      )
    `
  )

  if (driver !== "All") {
    query = query.eq("cars.driver_name", driver)
  }

  const { data, error } = await query
    .order("recorded_at", { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  const flattenedData = data.map((lap: any) => ({
    lapTimeMs: lap.lapTimeMs,
    recordedAt: lap.recordedAt,
    carId: lap.carId,
  }))

  return flattenedData
}

type LiveTimingLapTableProps = {
  drivers: string[]
  userName: string
}

export default function LiveTimingLapTable({
  drivers,
  userName,
}: LiveTimingLapTableProps) {
  const [selectedDriver, setSelectedDriver] = useState(userName)

  const { data, isLoading, isError, error } = useQuery<liveTimingTableData[]>({
    queryKey: ["laptimes", "liveTiming", selectedDriver],
    queryFn: () => fetchData(selectedDriver),
    refetchOnWindowFocus: false,
  })

  const {
    data: carsData,
    isLoading: isCarsDataLoading,
    error: carsDataError,
  } = useQuery<CarInfo[]>({
    queryKey: ["cars", "leaderboard", selectedDriver],
    queryFn: () => getCars(selectedDriver),
  })

  const [laps, setLaps] = useState<liveTimingTableData[]>(data || [])
  const supabase = createClient()

  useEffect(() => {
    if (data) {
      setLaps(data)
    }
  }, [data])

  const carIds = carsData ? carsData.map((car) => car.id) : []

  useEffect(() => {
    const channel = supabase
      .channel("public:laptimes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "laptimes",
          filter: `car_id=in.(${carIds.join(",")})`,
        },
        (payload) => {
          const rawNewLap = payload.new as {
            lap_time_ms: number
            recorded_at: string
            car_id: number
          }
          const newLap: liveTimingTableData = {
            lapTimeMs: rawNewLap.lap_time_ms,
            recordedAt: rawNewLap.recorded_at,
            carId: rawNewLap.car_id,
          }
          setLaps((prevLaps) => [newLap, ...(prevLaps || [])].slice(0, 50))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, laps, setLaps])

  if (isLoading || isCarsDataLoading) return <span>Loading...</span>
  if (isError) return <span>Error: {(error as Error).message}</span>
  if (carsDataError) {
    return <span>Error loading cars: {(carsDataError as Error).message}</span>
  }

  return (
    <>
      <h1 className="flex text-3xl font-bold mb-4 justify-center mt-10">
        Live-timing for {selectedDriver}
      </h1>
      <OptionSelector
        label="Driver"
        options={drivers}
        selectedOption={selectedDriver}
        setSelectedOption={setSelectedDriver}
      />
      <div className="my-5">
        <DataTable columns={columns} data={laps || []} />
      </div>
    </>
  )
}
