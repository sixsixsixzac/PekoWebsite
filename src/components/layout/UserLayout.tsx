
import { ReactNode } from "react"
import { MobileMenu, type MenuItem } from "@/components/common/MobileMenu"
import { DesktopMenu } from "@/components/DesktopMenu"
import { NotificationDropdown } from "@/components/common/NotificationDropdown"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { UserDropdownMenu } from "@/components/common/UserDropdownMenu"
import { Auth } from "@/lib/auth/auth"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { UserRoleEnum } from "@/lib/utils/roles"
import { constructAuthorAvatarUrl } from "@/lib/utils/image-url"
import { NavbarWrapper } from "./NavbarWrapper"
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
export async function UserLayout({ children }: UserLayoutProps) {
  const sessionUser = await Auth.user()
  const isAuthenticated = !!sessionUser

  // Fetch full user data from database if user is logged in
  let userData = null
  if (sessionUser?.id) {
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: parseInt(sessionUser.id) },
      select: {
        uuid: true,
        displayName: true,
        email: true,
        userImg: true,
        point: true,
        level: true,
        uName: true,
      },
    })

    if (userProfile) {
      // Map level to UserRoleEnum (0 = User, 6 = Writer, 7 = Admin)
      const role = userProfile.level === 7 
        ? UserRoleEnum.ADMIN 
        : userProfile.level === 6 
        ? UserRoleEnum.WRITER 
        : UserRoleEnum.USER

      userData = {
        display_name: userProfile.displayName,
        email: userProfile.email,
        avatar: constructAuthorAvatarUrl(userProfile.userImg),
        points: userProfile.point,
        role: role,
        uuid: userProfile.uuid,
        username: userProfile.uName,
      }
    }
  }

  // Base menu items available to all users
  const baseMenuItems: MenuItem[] = [
    { href: "/", label: "หน้าแรก", icon: "Home" },
    { href: "/search", label: "ค้นหา", icon: "Search" },
    { href: "/announcement", label: "ประกาศ", icon: "Megaphone" },
    { href: "/contact", label: "ติดต่อ", icon: "Mail" },
  ]

  // Authenticated-only menu items
  const authenticatedMenuItems: MenuItem[] = [
    { href: "/topup", label: "เติมเงิน", icon: "Coins" },
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

  // Combine base menu items with authenticated-only items if user is logged in
  const menuItems: MenuItem[] = [
    ...baseMenuItems,
    ...(isAuthenticated ? authenticatedMenuItems : []),
  ]

  return (
    <>
      {/* Navbar - Hidden on reading pages */}
      <NavbarWrapper
        sessionUser={sessionUser}
        userData={userData}
        menuItems={menuItems}
      />
      {children}
    </>
  )
}

