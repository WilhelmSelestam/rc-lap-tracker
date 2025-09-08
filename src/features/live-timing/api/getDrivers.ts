import { createClient } from "../../../../utils/supabase/client"

export async function getDrivers(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_unique_drivers")

  if (error) {
    throw new Error(error.message)
  }

  return data.map((item: { driver_name: string }) => item.driver_name)
}
