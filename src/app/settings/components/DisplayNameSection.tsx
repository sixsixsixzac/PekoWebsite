'use client'

import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchService, type FetchError } from '@/lib/services/fetch-service'
import { containsProfanity } from '@/lib/utils/text-validation'

interface DisplayNameFormData {
  display_name: string
}

interface DisplayNameSectionProps {
  initialDisplayName: string
  onDisplayNameUpdate?: (newDisplayName: string) => void
}

export function DisplayNameSection({
  initialDisplayName,
  onDisplayNameUpdate,
}: DisplayNameSectionProps) {
  const { update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const lastSubmitTime = useRef<number>(0)
  const originalDisplayName = useRef<string>(initialDisplayName)
  const RATE_LIMIT_MS = 2000 // 2 seconds between submissions

  const displayNameForm = useForm<DisplayNameFormData>({
    defaultValues: {
      display_name: initialDisplayName,
    },
  })

  // Update form when initialDisplayName changes
  useEffect(() => {
    if (initialDisplayName) {
      originalDisplayName.current = initialDisplayName
      displayNameForm.reset({
        display_name: initialDisplayName,
      })
    }
  }, [initialDisplayName, displayNameForm])

  const onDisplayNameSubmit = async (data: DisplayNameFormData) => {
    const trimmedName = data.display_name.trim()

    // Check if the name is the same as the original (case-insensitive)
    if (originalDisplayName.current.toLowerCase() === trimmedName.toLowerCase()) {
      toast.error('ชื่อที่แสดงเหมือนเดิม', {
        description: 'ไม่จำเป็นต้องอัปเดต',
      })
      return
    }

    // Check for banned words using existing utility
    if (containsProfanity(trimmedName)) {
      toast.error('กรุณาอย่ากรอกคำหยาบคำต้องห้าม', {
        description: 'ชื่อที่แสดงมีคำที่ไม่เหมาะสม',
      })
      return
    }

    // Client-side rate limiting: prevent rapid submissions
    const now = Date.now()
    const timeSinceLastSubmit = now - lastSubmitTime.current

    if (timeSinceLastSubmit < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000)
      toast.error(`กรุณารอ ${waitTime} วินาทีก่อนส่งอีกครั้ง`)
      return
    }

    lastSubmitTime.current = now
    setIsLoading(true)
    try {
      const result = await fetchService.put<{
        success: boolean
        displayName: string
      }>('/api/user/settings', {
        displayName: data.display_name,
      })

      toast.success('อัปเดตชื่อที่แสดงสำเร็จ', {
        description: `ชื่อที่แสดงใหม่: ${result.displayName}`,
      })

      // Update the original display name reference
      originalDisplayName.current = result.displayName

      // Notify parent component of the update
      onDisplayNameUpdate?.(result.displayName)

      // Refresh session to update the display name in the session
      // This will trigger session and csrf requests, which is expected behavior
      // to keep the session in sync with the updated display name
      updateSession().catch((error) => {
        console.error('Error updating session:', error)
        // Don't show error to user as the main operation succeeded
      })
    } catch (error) {
      console.error('Error updating display name:', error)
      
      // Handle rate limit errors specifically
      if (error && typeof error === 'object' && 'status' in error) {
        const fetchError = error as FetchError
        if (fetchError.status === 429) {
          const errorData = fetchError.data as { message?: string; retryAfter?: number } | undefined
          const retryAfter = errorData?.retryAfter || 60
          toast.error('ส่งคำขอบ่อยเกินไป', {
            description: errorData?.message || `กรุณารอ ${retryAfter} วินาทีก่อนลองอีกครั้ง`,
          })
          return
        }
      }
      
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการอัปเดตชื่อที่แสดง'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="size-5" />
          <CardTitle>เปลี่ยนชื่อที่แสดง</CardTitle>
        </div>
        <CardDescription>
          เปลี่ยนชื่อที่แสดงในโปรไฟล์ของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...displayNameForm}>
          <form
            onSubmit={displayNameForm.handleSubmit(onDisplayNameSubmit)}
            className="space-y-4"
          >
            <FormField
              control={displayNameForm.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อที่แสดง</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="กรุณากรอกชื่อที่แสดง"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    ชื่อนี้จะแสดงในโปรไฟล์และความคิดเห็นของคุณ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึก'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

