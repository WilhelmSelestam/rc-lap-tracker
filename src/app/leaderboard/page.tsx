"use server"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"
import Leaderboard, {
  fetchLeaderboard,
} from "../../features/leaderboard/Leaderboard"

export default async function LeaderboardPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["laptimes", "leaderboard"],
    queryFn: fetchLeaderboard,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Leaderboard />
    </HydrationBoundary>
  )
}
