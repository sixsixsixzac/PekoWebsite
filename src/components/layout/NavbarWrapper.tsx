"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MobileMenu, type MenuItem } from "@/components/common/MobileMenu"
import { DesktopMenu } from "@/components/DesktopMenu"
import { NotificationDropdown } from "@/components/common/NotificationDropdown"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { UserDropdownMenu } from "@/components/common/UserDropdownMenu"
import { Button } from "@/components/ui/button"

interface NavbarWrapperProps {
  sessionUser: any
  userData: any
  menuItems: MenuItem[]
}

export function NavbarWrapper({ sessionUser, userData, menuItems }: NavbarWrapperProps) {
  const pathname = usePathname()
  
  // Check if we're on a manga reading page (pattern: /manga/[uuid]/[episode])
  const isReadingPage = /^\/manga\/[^\/]+\/\d+$/.test(pathname)
  
  // Don't render navbar on reading pages
  if (isReadingPage) {
    return null
  }

  return (
    <>
      {/* Navbar */}
      <header className="sticky md:fixed top-0 z-50 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-3 items-center">
          {/* Left side - Logo and Mobile Menu Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile Menu */}
            <MobileMenu menuItems={menuItems} />

            {/* Logo - always go to landing page ("/") */}
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={570}
                height={103}
                className="h-auto w-56 sm:w-40 md:w-48 lg:w-56"
                priority
              />
            </Link>
          </div>

          {/* Center - Desktop Navigation Menu */}
          <div className="flex justify-center">
            <DesktopMenu menuItems={menuItems} />
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            {/* Theme Toggle - Show on mobile and desktop */}
            <div className="md:hidden">
              <ThemeToggle showOnMobile={true} />
            </div>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            {sessionUser && userData ? (
              <>
                <NotificationDropdown />
                <UserDropdownMenu user={userData} />
              </>
            ) : (
              <>
                {/* Sign In and Sign Up buttons - Show when user is not logged in */}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">เข้าสู่ระบบ</Link>
                </Button>
                <Button variant="default" size="sm" asChild className="hidden sm:flex">
                  <Link href="/auth/signup">สมัครสมาชิก</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Spacer for fixed header on desktop */}
      <div className="hidden md:block h-16" />
    </>
  )
}

