"use server"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import TimeTable, { fetchData } from "@/features/live-timing/TimeTable"
import { getDrivers } from "@/features/live-timing/api/getDrivers"

export default async function LiveTimingPage() {
  const queryClient = new QueryClient()

  // const drivers = await getDrivers()
  const drivers = ["Wilhelm Selestam"]

  await queryClient.prefetchQuery({
    queryKey: ["laptimes", "liveTiming"],
    queryFn: () => fetchData(drivers[0]),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TimeTable drivers={drivers} />
    </HydrationBoundary>
  )
}
