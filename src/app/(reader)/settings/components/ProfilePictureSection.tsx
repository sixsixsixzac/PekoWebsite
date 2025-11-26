"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Camera } from "lucide-react"

interface ProfilePictureSectionProps {
  imageUrl?: string
  displayName?: string
  onImageChange?: (file: File) => void
}

export function ProfilePictureSection({
  imageUrl,
  displayName,
  onImageChange,
}: ProfilePictureSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        alert("กรุณาเลือกรูปภาพประเภท PNG หรือ JPG เท่านั้น")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      const newPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(newPreviewUrl)

      if (onImageChange) {
        onImageChange(file)
      }
    }
  }

  const displayImage = previewUrl || imageUrl || undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          รูปภาพโปรไฟล์
        </CardTitle>
        <CardDescription>
          เปลี่ยนรูปภาพโปรไฟล์ของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={displayImage}
              alt={displayName || "User"}
            />
            <AvatarFallback className="text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="profile-image" className="cursor-pointer">
                <Camera className="h-4 w-4 mr-2" />
                เลือกรูปภาพ
              </label>
            </Button>
            <input
              ref={fileInputRef}
              id="profile-image"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <p className="text-sm text-muted-foreground">
              JPG หรือ PNG สูงสุด 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


