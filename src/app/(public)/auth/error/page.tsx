import { generateMetadata } from "@/lib/utils/metadata"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = generateMetadata({
  title: "เกิดข้อผิดพลาด",
  description: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
  keywords: ["Pekotoon", "error", "ข้อผิดพลาด"],
})

interface ErrorPageProps {
  searchParams: {
    error?: string
  }
}

const errorMessages: Record<string, string> = {
  Configuration: "เกิดข้อผิดพลาดในการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ",
  AccessDenied: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
  Verification: "ลิงก์ยืนยันหมดอายุหรือไม่ถูกต้อง",
  Default: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const error = searchParams.error || "Default"
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/signin">ลองเข้าสู่ระบบอีกครั้ง</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">กลับหน้าหลัก</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


