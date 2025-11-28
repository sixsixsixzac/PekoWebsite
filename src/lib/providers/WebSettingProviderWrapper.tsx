import { prisma } from "@/lib/prisma"
import { WebSettingProvider } from "./WebSettingProvider"
import type { ReactNode } from "react"

interface WebSettingProviderWrapperProps {
  children: ReactNode
}

export async function WebSettingProviderWrapper({
  children,
}: WebSettingProviderWrapperProps) {
  // Fetch all web settings from database
  const settings = await prisma.webSetting.findMany({
    orderBy: {
      key: "asc",
    },
  })

  return <WebSettingProvider settings={settings}>{children}</WebSettingProvider>
}

