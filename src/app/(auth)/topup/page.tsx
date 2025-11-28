import { generateMetadata } from "@/lib/utils/metadata"
import type { Metadata } from "next"
import { TopupForm } from "@/components/topup/TopupForm"
import { getTopupPackages } from "@/lib/api/topup"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = generateMetadata({
  title: "เติมเงิน",
  description: "เติมเงินเพื่อซื้อเหรียญสำหรับซื้อตอนการ์ตูน",
  keywords: ["เติมเงิน", "topup", "coins", "เหรียญ"],
})

export default async function TopupPage() {
  // Fetch topup packages server-side
  const packages = await getTopupPackages()
  
  // Fetch user points if logged in
  let userPoints: number | null = null
  const currentUser = await getCurrentUser()
  if (currentUser?.id) {
    try {
      const userId = parseInt(currentUser.id)
      if (!isNaN(userId)) {
        const userProfile = await prisma.userProfile.findUnique({
          where: { id: userId },
          select: { point: true },
        })
        userPoints = userProfile?.point ?? null
      }
    } catch (error) {
      console.error("Error fetching user points:", error)
    }
  }

  return <TopupForm packages={packages} initialUserPoints={userPoints} />
}

