"use server"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import Leaderboard, {
  fetchLeaderboard,
} from "../../features/leaderboard/Leaderboard"
import { getDrivers } from "@/features/live-timing/api/getDrivers"

export default async function LeaderboardPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["laptimes", "leaderboard"],
    queryFn: () => fetchLeaderboard("All", "All"),
  })

  const drivers = await getDrivers()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Leaderboard drivers={drivers} />
    </HydrationBoundary>
  )
}
