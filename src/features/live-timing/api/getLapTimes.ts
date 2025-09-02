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
        cars (
          carName: car_name,
          driverName: driver_name
        )
      `
    )
    .eq("cars.driver_name", "Wilhelm Selestam")
    .order("lap_time_ms", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const flattenedData = data.map((lap: any) => ({
    lapTimeMs: lap.lapTimeMs,
    time: lap.cars.driverName,
  }))

  return flattenedData
}
