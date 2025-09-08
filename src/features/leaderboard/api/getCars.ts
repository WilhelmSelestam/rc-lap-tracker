import { createClient } from "../../../../utils/supabase/client"

export async function getCars(driverName: string): Promise<string[]> {
  const supabase = createClient()
  let query = supabase.from("cars").select(`car_name, driver_name`)

  if (driverName !== "All") {
    query = query.eq("driver_name", driverName)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    throw new Error(error.message)
  }

  return data.map((item: any) => item.car_name)
}
