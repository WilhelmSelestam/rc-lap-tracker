"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "../../../utils/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh() // This will re-trigger the middleware and redirect to /login
  }

  return <Button onClick={handleSignOut}>Sign Out</Button>
}
