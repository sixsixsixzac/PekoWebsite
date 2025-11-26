import { generateMetadata } from "@/lib/utils/metadata"
import type { Metadata } from "next"
import { SignUpForm } from "@/components/auth/SignUpForm"

export const metadata: Metadata = generateMetadata({
  title: "สมัครสมาชิก",
  description: "สมัครสมาชิกเพื่อเริ่มใช้งาน ",
  keywords: ["Pekotoon", "สมัครสมาชิก", "sign up", "register"],
})

export default function SignUpPage() {
  return <SignUpForm />
}


