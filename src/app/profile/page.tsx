import { createClient } from "../../../utils/supabase/server"
import { SignOutButton } from "./SignOutButton"
import { DataTable } from "@/components/DataTable"
import { columns } from "./CarsColumns"
import { Car } from "@/types"
import { AddCarDialog } from "./AddCarDialog"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>You are not signed in.</div>
  }

  const { data: cars, error } = await supabase
    .from("cars")
    .select("*")
    .eq("driver_name", user.user_metadata?.full_name)

  if (error) {
    // console.error("Error fetching cars:", error)
  }

  console.log("Fetched cars:", cars)

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center space-x-4 mb-8">
        <img
          src={user.user_metadata?.avatar_url}
          alt="User avatar"
          className="rounded-full w-24 h-24"
        />
        <div>
          <h1 className="text-2xl font-bold">
            {user.user_metadata?.full_name || user.email}
          </h1>
          {/* <p className="text-gray-500">{user.email}</p> */}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <AddCarDialog />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Cars</h2>
        {/* <DataTable columns={columns} data={cars as Car[]} /> */}
        <DataTable columns={columns} data={cars || []} />
      </div>
      <div className="ml-auto flex items-center space-x-4 space-y-4 mt-20">
        <SignOutButton />
      </div>
    </div>
  )
}
