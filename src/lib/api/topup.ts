import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export interface TopupPackage {
  id: string
  price: number
  coins: number
  bonus?: number
  popular?: boolean
}

/**
 * Fetch all active topup packages from database
 * Server-side only - for use in Server Components
 */
export async function getTopupPackages(): Promise<TopupPackage[]> {
  try {
    const packages = await prisma.topupPackage.findMany({
      where: {
        status: "show", // Only show active packages
      },
      orderBy: {
        price: "asc", // Order by price ascending
      },
      select: {
        id: true,
        price: true,
        coinAmount: true,
        bonus: true,
      },
    })

    // Transform Prisma Decimal to number and format data
    return packages.map((pkg, index) => {
      // Handle Prisma Decimal type
      const price = pkg.price instanceof Prisma.Decimal
        ? pkg.price.toNumber()
        : typeof pkg.price === "number"
        ? pkg.price
        : Number(pkg.price)
      
      const bonus = typeof pkg.bonus === "number" ? pkg.bonus : 0
      
      // Mark popular packages (you can customize this logic)
      // For now, we'll mark packages with bonus > 10% as popular
      const bonusPercentage = (bonus / pkg.coinAmount) * 100
      const popular = bonusPercentage > 10 || index === 2 || index === 4 // Also mark 3rd and 5th as popular
      
      return {
        id: pkg.id.toString(),
        price: Math.round(price),
        coins: pkg.coinAmount,
        bonus: bonus > 0 ? Math.round(bonus) : undefined,
        popular,
      }
    })
  } catch (error) {
    console.error("Error fetching topup packages:", error)
    // Return mock data as fallback
    return []
  }
}

