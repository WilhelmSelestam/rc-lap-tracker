import { createClient } from "../../../../utils/supabase/client"
import { liveTimingData } from "../Columns"

export async function getLapTimesByDriver(
  driverName: string
): Promise<liveTimingData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("laptimes")
    .select(
      `
        lapTimeMs: lap_time_ms,
        recordedAt: recorded_at,
        cars (
          carName: car_name,
          driverName: driver_name
        )
      `
    )
    .eq("cars.driver_name", driverName)
    .order("lap_time_ms", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const flattenedData = data.map((lap: any) => ({
    lapTimeMs: lap.lapTimeMs,
    recordedAt: lap.recordedAt,
  }))

  return flattenedData
}

export const fetchLiveTimingData = async (): Promise<liveTimingData[]> => {
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
    recordedAt: lap.cars.driverName,
  }))

  return flattenedData
}
