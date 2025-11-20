import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a blur data URL for image placeholders
 * This is a small blurred image (10x10) that creates a proper blur effect
 */
export function getBlurDataURL(): string {
  // A small 10x10 pixel image with blur effect, base64 encoded
  // This creates a visible blur placeholder
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGZpbHRlciBpZD0iYmx1ciIgeD0iLTEwMCUiIHk9Ii0xMDAlIiB3aWR0aD0iMzAwJSIgaGVpZ2h0PSIzMDAlIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI0Ii8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDA%2BJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIiBmaWx0ZXI9InVybCgjYmx1cikiLz48L3N2Zz4="
}
