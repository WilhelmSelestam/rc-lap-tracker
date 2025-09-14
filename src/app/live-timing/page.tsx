"use server"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import LiveTimingLapTable, {
  fetchData,
} from "@/features/live-timing/LiveTimingLapTable"
import { getDrivers } from "@/features/live-timing/api/getDrivers"
import { createClient } from "../../../utils/supabase/server"

export default async function LiveTimingPage() {
  const queryClient = new QueryClient()

  const drivers = await getDrivers()
  // const drivers = ["Wilhelm Selestam"]

  // await queryClient.prefetchQuery({
  //   queryKey: ["laptimes", "liveTiming"],
  //   queryFn: () => fetchData(drivers[0]),
  // })

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>You are not signed in.</div>
  }

  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
    <LiveTimingLapTable
      drivers={drivers}
      userName={user?.user_metadata?.name}
    />
    // </HydrationBoundary>
  )
}
