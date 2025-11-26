"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ProfilePictureSection } from "./components/ProfilePictureSection"
import { DisplayNameSection } from "./components/DisplayNameSection"
import { GeneralSettingsSection } from "./components/GeneralSettingsSection"
import { GoogleAccountSection } from "./components/GoogleAccountSection"
import { SocialMediaSection, type SocialLinks } from "./components/SocialMediaSection"
import { ChangePasswordSection } from "./components/ChangePasswordSection"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    x: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    discord: "",
    facebook: ""
  })

  useEffect(() => {
    if (session?.user?.socialMedia) {
      setSocialLinks(session.user.socialMedia)
    }
  }, [session])

  const handleProfileImageChange = (file: File) => {
    console.log("Profile image selected:", file.name)
  }

  const handleDisplayNameSave = (displayName: string) => {
    console.log("Display name saved:", displayName)
  }

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  const handleSocialLinksSave = () => {
    console.log("Social links saved:", socialLinks)
  }

  const handlePasswordChange = (_passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    console.log("Password change requested")
  }

  const handleGoogleConnect = () => {
    setIsGoogleConnected(!isGoogleConnected)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ตั้งค่า</h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
          </p>
        </div>

        <ProfilePictureSection
          imageUrl={session?.user?.image || undefined}
          displayName={session?.user?.name || ""}
          onImageChange={handleProfileImageChange}
        />

        <DisplayNameSection
          initialDisplayName={session?.user?.name || ""}
          onSave={handleDisplayNameSave}
        />

        <GeneralSettingsSection />

        <GoogleAccountSection
          isConnected={isGoogleConnected}
          onConnect={handleGoogleConnect}
        />

        <SocialMediaSection
          socialLinks={socialLinks}
          onLinkChange={handleSocialLinkChange}
          onSave={handleSocialLinksSave}
        />

        <ChangePasswordSection
          onChange={handlePasswordChange}
        />
      </div>
    </div>
  )
}


