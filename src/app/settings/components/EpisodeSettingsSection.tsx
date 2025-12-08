'use client'

import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'
import { fetchService } from '@/lib/services/fetch-service'

interface EpisodeSettingsData {
  buyImmediately: boolean
  loadFullImages: boolean
}

interface EpisodeSettingsSectionProps {
  initialBuyImmediately: boolean
  initialLoadFullImages: boolean
  onSettingsUpdate?: (updates: Partial<EpisodeSettingsData>) => void
}

export function EpisodeSettingsSection({
  initialBuyImmediately,
  initialLoadFullImages,
  onSettingsUpdate,
}: EpisodeSettingsSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isUpdating = useRef(false)

  const episodeSettingsForm = useForm<EpisodeSettingsData>({
    defaultValues: {
      buyImmediately: initialBuyImmediately,
      loadFullImages: initialLoadFullImages,
    },
  })

  // Update form when initial values change
  useEffect(() => {
    episodeSettingsForm.reset({
      buyImmediately: initialBuyImmediately,
      loadFullImages: initialLoadFullImages,
    })
  }, [initialBuyImmediately, initialLoadFullImages, episodeSettingsForm])

  const onEpisodeSettingsChange = async (data: EpisodeSettingsData) => {
    // Prevent multiple simultaneous updates
    if (isUpdating.current) return
    isUpdating.current = true
    setIsLoading(true)

    try {
      await fetchService.patch<{
        success: boolean
        buyImmediately?: boolean
        loadFullImages?: boolean
      }>('/api/user/settings', {
        buyImmediately: data.buyImmediately,
        loadFullImages: data.loadFullImages,
      })

      // Notify parent component of the update
      onSettingsUpdate?.({
        buyImmediately: data.buyImmediately,
        loadFullImages: data.loadFullImages,
      })

      // Success - settings saved silently (no toast for auto-save)
    } catch (error) {
      console.error('Error updating episode settings:', error)
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้', {
        description: 'กรุณาลองอีกครั้ง',
      })
      // Revert to previous values on error by refetching
      const currentValues = episodeSettingsForm.getValues()
      episodeSettingsForm.reset(currentValues)
    } finally {
      setIsLoading(false)
      isUpdating.current = false
    }
  }

  const handleSwitchChange = async (
    fieldName: keyof EpisodeSettingsData,
    checked: boolean
  ) => {
    episodeSettingsForm.setValue(fieldName, checked)
    const currentValues = episodeSettingsForm.getValues()
    await onEpisodeSettingsChange(currentValues)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="size-5" />
          <CardTitle>ตั้งค่าตอน</CardTitle>
        </div>
        <CardDescription>
          จัดการการตั้งค่าการอ่านตอนและการแสดงผล
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...episodeSettingsForm}>
          <form className="space-y-6">
            <FormField
              control={episodeSettingsForm.control}
              name="buyImmediately"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      ซื้อตอนอัตโนมัติ
                    </FormLabel>
                    <FormDescription>
                      ซื้อตอนใหม่โดยอัตโนมัติเมื่อคุณเริ่มอ่าน
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        handleSwitchChange('buyImmediately', checked)
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={episodeSettingsForm.control}
              name="loadFullImages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      โหลดรูปภาพทั้งหมด
                    </FormLabel>
                    <FormDescription>
                      โหลดรูปภาพทั้งหมดในตอนทันทีแทนการโหลดแบบทีละรูป
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        handleSwitchChange('loadFullImages', checked)
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

