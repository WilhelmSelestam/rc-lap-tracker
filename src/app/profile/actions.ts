"use server"

import { createClient } from "../../../utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCarName(carId: number, newName: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("cars")
    .update({ car_name: newName })
    .eq("id", carId)

  if (error) {
    console.error("Error updating car name:", error)
    return { error }
  }

  revalidatePath("/profile")
  return { data }
}

export async function addCar(carName: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: "You must be logged in to add a car." } }
  }

  const { data, error } = await supabase.from("cars").insert([
    {
      car_name: carName,
      driver_id: user.id,
      driver_name: user.user_metadata?.full_name,
    },
  ])

  if (error) {
    console.error("Error adding car:", error)
    return { error }
  }

  revalidatePath("/profile")
  return { data }
}
