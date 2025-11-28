"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { WebSettingBase } from "@/types/models"

interface WebSettingContextValue {
  settings: Record<string, string | null>
  getSetting: (key: string) => string | null
  hasSetting: (key: string) => boolean
}

const WebSettingContext = createContext<WebSettingContextValue | undefined>(
  undefined
)

interface WebSettingProviderProps {
  children: ReactNode
  settings: WebSettingBase[]
}

export function WebSettingProvider({
  children,
  settings,
}: WebSettingProviderProps) {
  // Convert array to object for easier access
  const settingsMap = settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, string | null>
  )

  const getSetting = (key: string): string | null => {
    return settingsMap[key] ?? null
  }

  const hasSetting = (key: string): boolean => {
    return key in settingsMap
  }

  const value: WebSettingContextValue = {
    settings: settingsMap,
    getSetting,
    hasSetting,
  }

  return (
    <WebSettingContext.Provider value={value}>
      {children}
    </WebSettingContext.Provider>
  )
}

export function useWebSettings(): WebSettingContextValue {
  const context = useContext(WebSettingContext)
  if (context === undefined) {
    throw new Error("useWebSettings must be used within a WebSettingProvider")
  }
  return context
}

