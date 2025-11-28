"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type MenuItem } from "./common/MobileMenu"
import { cn } from "@/lib/utils"

interface DesktopMenuProps {
  menuItems: MenuItem[] // Menu items are pre-filtered server-side based on user roles
  className?: string
}

/**
 * DesktopMenu component - Client component for active state detection
 * 
 * Security Note: This component only receives pre-filtered menuItems from the server.
 * Sensitive routes should be filtered out in the parent server component (e.g., UserLayout)
 * before being passed to this component. This ensures admin-only routes are never exposed
 * to non-admin users.
 */
export function DesktopMenu({ menuItems, className = "" }: DesktopMenuProps) {
  const pathname = usePathname()

  return (
    <nav className={`hidden md:flex items-center gap-6 lg:gap-6 flex-nowrap ${className}`}>
      {menuItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors py-2 px-2 rounded-md whitespace-nowrap flex-shrink-0",
              isActive
                ? "text-primary bg-accent"
                : "hover:text-primary hover:bg-accent/50"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

