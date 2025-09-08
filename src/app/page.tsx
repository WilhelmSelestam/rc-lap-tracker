"use server"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-gray-50 rounded-lg shadow-md dark:bg-gray-800 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Your RC Lap Tracker Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Everything you need to track your RC racing.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Link href="/live-timing" passHref>
            <Button className="w-full h-24 text-lg" variant="outline">
              Live Timing
            </Button>
          </Link>
          <Link href="/leaderboard" passHref>
            <Button className="w-full h-24 text-lg" variant="outline">
              Leaderboard
            </Button>
          </Link>
          <Link href="/profile" passHref>
            <Button className="w-full h-24 text-lg" variant="outline">
              My Profile
            </Button>
          </Link>
          <Link href="/#" passHref>
            <Button className="w-full h-24 text-lg" variant="outline" disabled>
              Garage (Coming Soon)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
