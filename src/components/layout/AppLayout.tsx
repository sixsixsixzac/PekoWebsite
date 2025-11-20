
import { ReactNode } from "react"
import { UserLayout } from "./UserLayout"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  // Default to user role for now - auth will be added later
  return <UserLayout>{children}</UserLayout>
}


