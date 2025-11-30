"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getBlurDataURL } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  fallbackText?: string;
  itemProp?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className,
  priority = false,
  quality = 85,
  fallbackText,
  itemProp,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isDicebearImage = src?.includes("api.dicebear.com");
  // Check if it's a local image (starts with /images/ or /uploads/)
  const isLocalImage = src?.startsWith("/images/") || src?.startsWith("/uploads/");
  const isPriority = Boolean(priority);
  
  // Force unoptimized for local images to prevent 400 errors
  const shouldUnoptimize = isDicebearImage || isLocalImage;

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
    onError?.();
  };

  const placeholder: "empty" | "blur" = isPriority ? "empty" : "blur";

  const imageProps = {
    src,
    alt,
    className: cn(
      "object-cover",
      // Avoid expensive opacity transitions for LCP/priority images
      isPriority
        ? ""
        : "transition-opacity duration-500 " + (imageLoaded ? "opacity-100" : "opacity-0"),
      className
    ),
    loading: isPriority ? ("eager" as const) : ("lazy" as const),
    priority: isPriority,
    quality,
    // For LCP images, skip blurred placeholder to reduce paint & decoding work
    placeholder,
    ...(placeholder === "blur" ? { blurDataURL: getBlurDataURL() } : {}),
    // Unoptimize dicebear images and local images to avoid 400 errors in production
    // This prevents Next.js from trying to optimize images that may not exist or cause issues
    unoptimized: shouldUnoptimize,
    onLoad: handleLoad,
    onError: handleError,
    ...(itemProp && { itemProp }),
    ...(sizes && { sizes }),
  };

  // Error fallback UI
  if (imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <div className="text-center p-4">
          <BookOpen className="size-12 mx-auto text-muted-foreground/50 mb-2" />
          {fallbackText && (
            <p className="text-xs text-muted-foreground/70">{fallbackText}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {fill ? (
        <Image fill {...imageProps} />
      ) : (
        <Image width={width} height={height} {...imageProps} />
      )}
      {/* Blurred overlay that fades out when image loads (disabled for priority/LCP images) */}
      {!imageError && !isPriority && (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500 pointer-events-none",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{
            backgroundImage: `url(${src})`,
            filter: "blur(20px)",
            transform: "scale(1.1)", // Slight scale to hide blur edges
          }}
        />
      )}
    </>
  );
}

