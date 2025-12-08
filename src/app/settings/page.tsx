'use client'

import { useEffect, useState } from 'react'
import { DisplayNameSection } from './components/DisplayNameSection'
import { EpisodeSettingsSection } from './components/EpisodeSettingsSection'
import { GoogleLinkSection } from './components/GoogleLinkSection'
import { PasswordSection } from './components/PasswordSection'
import { fetchService } from '@/lib/services/fetch-service'

interface UserSettings {
  displayName: string
  buyImmediately: boolean
  loadFullImages: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all settings once on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await fetchService.get<UserSettings>('/api/user/settings')
        setSettings({
          displayName: data.displayName ?? '',
          buyImmediately: data.buyImmediately ?? false,
          loadFullImages: data.loadFullImages ?? false,
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
        // Use defaults on error
        setSettings({
          displayName: '',
          buyImmediately: false,
          loadFullImages: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Show loading state or render components with settings
  if (isLoading || !settings) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">ตั้งค่า</h1>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">ตั้งค่า</h1>

      <div className="space-y-6">
        <DisplayNameSection
          initialDisplayName={settings.displayName}
          onDisplayNameUpdate={(newDisplayName) => {
            setSettings((prev) => prev ? { ...prev, displayName: newDisplayName } : null)
          }}
        />
        <EpisodeSettingsSection
          initialBuyImmediately={settings.buyImmediately}
          initialLoadFullImages={settings.loadFullImages}
          onSettingsUpdate={(updates) => {
            setSettings((prev) => prev ? { ...prev, ...updates } : null)
          }}
        />
        <GoogleLinkSection />
        <PasswordSection />
      </div>
    </div>
  )
}










