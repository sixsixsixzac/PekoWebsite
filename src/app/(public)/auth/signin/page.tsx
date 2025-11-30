import { generateMetadata } from "@/lib/utils/metadata"
import type { Metadata } from "next"
import { Suspense } from "react"
import { SignInForm } from "@/components/auth/SignInForm"

export const metadata: Metadata = generateMetadata({
  title: "เข้าสู่ระบบ",
  description: "เข้าสู่ระบบเพื่อใช้งาน",
  keywords: ["Pekotoon", "เข้าสู่ระบบ", "sign in", "login"],
})

export default function SignInPage() {
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">กำลังโหลด...</div>}>
      <SignInForm recaptchaSiteKey={recaptchaSiteKey} />
    </Suspense>
  )
}


