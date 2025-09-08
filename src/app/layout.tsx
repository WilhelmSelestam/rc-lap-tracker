import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import "./globals.css"
import Providers from "./providers"
import { AppSidebar } from "@/components/AppSidebar"
import { cookies } from "next/headers"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <html lang="en">
      <body>
        <SidebarProvider defaultOpen={defaultOpen}>
          {/* <div className="container"> */}
          <AppSidebar />
          <div className="container mx-auto">
            <SidebarTrigger className="size-20" />
            <div className="container max-w-8/9 m-10">
              <Providers>{children}</Providers>
            </div>
          </div>
          {/* </div> */}
        </SidebarProvider>
      </body>
    </html>
  )
}
