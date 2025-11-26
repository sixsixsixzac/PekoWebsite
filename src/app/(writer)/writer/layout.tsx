import type { ReactNode } from "react"
import { WriterLayout } from "@/components/layout/WriterLayout"

interface WriterRouteLayoutProps {
  children: ReactNode
}

export default function WriterRouteLayout({ children }: WriterRouteLayoutProps) {
  return <WriterLayout>{children}</WriterLayout>
}


