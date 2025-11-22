"use client"

import { useEffect } from "react"

/**
 * Prevents body scrollbar by adding overflow-hidden to body
 * This is needed when using ScrollArea to avoid double scrollbars
 */
export function PreventBodyScroll() {
  useEffect(() => {
    // Add overflow-hidden to body
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    // Cleanup: restore overflow on unmount
    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [])

  return null
}

