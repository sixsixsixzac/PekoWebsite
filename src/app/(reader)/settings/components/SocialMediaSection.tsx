"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link as LinkIcon, X, Instagram, Youtube, Facebook, MessageCircle, Music } from "lucide-react"

export interface SocialLinks {
  x: string
  instagram: string
  youtube: string
  tiktok: string
  discord: string
  facebook: string
}

interface SocialMediaSectionProps {
  socialLinks?: SocialLinks
  onLinkChange?: (platform: keyof SocialLinks, value: string) => void
  onSave?: () => void
}

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "x":
      return <X className="h-4 w-4" />
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    case "tiktok":
      return <Music className="h-4 w-4" />
    case "discord":
      return <MessageCircle className="h-4 w-4" />
    case "facebook":
      return <Facebook className="h-4 w-4" />
    default:
      return <LinkIcon className="h-4 w-4" />
  }
}

const getSocialLabel = (platform: string) => {
  switch (platform) {
    case "x":
      return "X (Twitter)"
    case "instagram":
      return "Instagram"
    case "youtube":
      return "YouTube"
    case "tiktok":
      return "TikTok"
    case "discord":
      return "Discord"
    case "facebook":
      return "Facebook"
    default:
      return platform
  }
}

export function SocialMediaSection({
  socialLinks = {
    x: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    discord: "",
    facebook: ""
  },
  onLinkChange,
  onSave,
}: SocialMediaSectionProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof SocialLinks, string>>>({})

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      return true
    }

    try {
      const urlObj = new URL(url)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleLinkChange = (platform: keyof SocialLinks, value: string) => {
    if (errors[platform]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[platform]
        return newErrors
      })
    }

    if (onLinkChange) {
      onLinkChange(platform, value)
    }
  }

  const handleBlur = (platform: keyof SocialLinks, value: string) => {
    if (!validateUrl(value)) {
      setErrors(prev => ({
        ...prev,
        [platform]: "กรุณากรอก URL ที่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)"
      }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[platform]
        return newErrors
      })
    }
  }

  const handleSave = () => {
    const newErrors: Partial<Record<keyof SocialLinks, string>> = {}
    let hasErrors = false

    Object.entries(socialLinks).forEach(([platform, value]) => {
      if (!validateUrl(value)) {
        newErrors[platform as keyof SocialLinks] =
          "กรุณากรอก URL ที่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)"
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (!hasErrors && onSave) {
      onSave()
    }
  }

  const getPlaceholder = (platform: string) => {
    if (platform === "x") return "https://x.com/username"
    if (platform === "youtube") return "https://youtube.com/@username"
    return `https://${platform}.com/username`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          โซเชียลมีเดีย
        </CardTitle>
        <CardDescription>
          เพิ่มลิงก์โซเชียลมีเดียของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(socialLinks).map(([platform, value]) => (
          <div key={platform} className="space-y-2">
            <Label htmlFor={`social-${platform}`} className="flex items-center gap-2">
              {getSocialIcon(platform)}
              {getSocialLabel(platform)}
            </Label>
            <Input
              id={`social-${platform}`}
              type="text"
              value={value}
              onChange={(e) => handleLinkChange(platform as keyof SocialLinks, e.target.value)}
              onBlur={(e) => handleBlur(platform as keyof SocialLinks, e.target.value)}
              placeholder={getPlaceholder(platform)}
              className={errors[platform as keyof SocialLinks] ? "border-destructive" : ""}
              aria-invalid={!!errors[platform as keyof SocialLinks]}
              aria-describedby={
                errors[platform as keyof SocialLinks] ? `social-${platform}-error` : undefined
              }
            />
            {errors[platform as keyof SocialLinks] && (
              <p
                id={`social-${platform}-error`}
                className="text-sm text-destructive"
                role="alert"
              >
                {errors[platform as keyof SocialLinks]}
              </p>
            )}
          </div>
        ))}
        <Button
          className="mt-4"
          onClick={handleSave}
          disabled={Object.keys(errors).length > 0}
        >
          บันทึกลิงก์โซเชียลมีเดีย
        </Button>
      </CardContent>
    </Card>
  )
}


