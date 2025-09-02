import { createClient } from "../../../../utils/supabase/client"

export async function getDrivers(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("cars").select(
    `driver_name
      `
  )

  if (error) {
    throw new Error(error.message)
  }

  return data.map((item: any) => item.driver_name)
}
