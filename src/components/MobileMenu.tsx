"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Menu,
  Home,
  Search,
  Megaphone,
  Mail,
  Settings,
  Users,
  FileText,
  Shield,
  type LucideIcon,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Icon map for string-based icon selection
const iconMap: Record<string, LucideIcon> = {
  Home,
  Search,
  Megaphone,
  Mail,
  Settings,
  Users,
  FileText,
  Shield,
}

export interface MenuItem {
  href: string
  label: string
  icon: string // Changed to string
}

interface MobileMenuProps {
  menuItems: MenuItem[] // Menu items are pre-filtered server-side based on user roles
  title?: string
}

/**
 * MobileMenu component - Client component for active state detection
 * 
 * Security Note: This component only receives pre-filtered menuItems from the server.
 * Sensitive routes should be filtered out in the parent server component (e.g., UserLayout)
 * before being passed to this component. This ensures admin-only routes are never exposed
 * to non-admin users.
 */
export function MobileMenu({ menuItems, title = "เมนู" }: MobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 sm:w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
            <SheetTitle className="text-xl font-bold tracking-tight">{title}</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon] || Home
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] group cursor-pointer",
                    isActive
                      ? "bg-accent text-primary"
                      : "hover:bg-accent hover:text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/20"
                        : "bg-muted/50 group-hover:bg-primary/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-primary"
                      )}
                    />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

