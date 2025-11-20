import type { Metadata } from "next"
import dotenv from "dotenv"
dotenv.config()

const BRAND_NAME = process.env.BRAND_NAME
const DEFAULT_DESCRIPTION = process.env.DEFAULT_DESCRIPTION

/**
 * Generate metadata for a page with SEO support
 * Format: "page name - brandname"
 * 
 * @param title - The page title (e.g., "หน้าหลัก")
 * @param description - Optional page description
 * @param keywords - Optional keywords for SEO
 * @param image - Optional Open Graph image URL
 * @returns Metadata object for Next.js
 */
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  noIndex = false,
}: {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
}): Metadata {
  // Use BRAND_NAME if available, otherwise fallback to "Pekotoon"
  const brandName = BRAND_NAME || "DEMO"
  const fullTitle = `${title} - ${brandName}`
  const metaDescription = description || DEFAULT_DESCRIPTION

  return {
    // Return just the title - the root layout template will add the brand name
    title: title,
    description: metaDescription,
    keywords: keywords?.join(", "),
    openGraph: {
      // Use full title for Open Graph (no template applied)
      title: fullTitle,
      description: metaDescription,
      type: "website",
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      // Use full title for Twitter (no template applied)
      title: fullTitle,
      description: metaDescription,
      ...(image && { images: [image] }),
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}

