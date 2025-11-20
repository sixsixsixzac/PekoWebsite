import { generateMetadata } from '@/lib/utils/metadata'
import type { Metadata } from 'next'
import { SignInForm } from '@/components/auth/SignInForm'

export const metadata: Metadata = generateMetadata({
  title: 'เข้าสู่ระบบ',
  description: 'เข้าสู่ระบบเพื่อใช้งาน',
  keywords: ['Pekotoon', 'เข้าสู่ระบบ', 'sign in', 'login'],
})

export default function SignInPage() {
  return <SignInForm />
}
