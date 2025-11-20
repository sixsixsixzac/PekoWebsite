
import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { MobileMenu, type MenuItem } from "@/components/MobileMenu"
import { DesktopMenu } from "@/components/DesktopMenu"
import { NotificationDropdown } from "@/components/NotificationDropdown"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserDropdownMenu } from "@/components/UserDropdownMenu"
// import { getCurrentUser } from "@/lib/auth/session"
// import { isAdmin, isWriter } from "@/lib/utils/roles"

interface UserLayoutProps {
  children: ReactNode
}

/**
 * UserLayout - Server Component
 * 
 * This component determines menu items server-side based on user roles.
 * Only menu items the user has access to are passed to client components.
 * This ensures sensitive routes (e.g., admin routes) are never exposed to unauthorized users.
 */
export function UserLayout({ children }: UserLayoutProps) {
  // Example: Get user session server-side (uncomment when auth is implemented)
  // const user = await getCurrentUser()
  // const userRole = user?.role

  // Base menu items available to all users
  const baseMenuItems: MenuItem[] = [
    { href: "/", label: "หน้าแรก", icon: "Home" },
    { href: "/search", label: "ค้นหา", icon: "Search" },
    { href: "/announcement", label: "ประกาศ", icon: "Megaphone" },
    { href: "/contact", label: "ติดต่อ", icon: "Mail" },
  ]

  // Example: Add role-specific menu items (uncomment when auth is implemented)
  // const adminMenuItems: MenuItem[] = [
  //   { href: "/admin", label: "จัดการระบบ", icon: "Shield" },
  // ]
  // const writerMenuItems: MenuItem[] = [
  //   { href: "/writer", label: "เขียน", icon: "FileText" },
  // ]

  // Filter menu items based on user role (server-side filtering)
  // const menuItems: MenuItem[] = [
  //   ...baseMenuItems,
  //   ...(isWriter(userRole) ? writerMenuItems : []),
  //   ...(isAdmin(userRole) ? adminMenuItems : []),
  // ]

  // For now, use base menu items only
  const menuItems: MenuItem[] = baseMenuItems

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile Menu */}
            <MobileMenu menuItems={menuItems} />

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={570}
                height={103}
                className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <DesktopMenu menuItems={menuItems} />

          {/* Right side - User menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            <UserDropdownMenu />
          </div>
        </div>
      </header>
      {children}
    </>
  )
}

