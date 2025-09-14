import { createClient } from "../../../../utils/supabase/client"

export type CarInfo = {
  car_name: string
  driver_name: string
  id: number
}

export async function getCars(driverName: string): Promise<CarInfo[]> {
  const supabase = createClient()
  let query = supabase.from("cars").select(`car_name, driver_name, id`)

  if (driverName !== "All") {
    query = query.eq("driver_name", driverName)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    throw new Error(error.message)
  }

  return data.map((car) => ({
    car_name: car.car_name,
    driver_name: car.driver_name,
    id: car.id,
  }))
}
