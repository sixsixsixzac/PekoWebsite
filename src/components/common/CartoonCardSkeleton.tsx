import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Eye, Heart, BookOpen } from "lucide-react";

interface CartoonCardSkeletonProps {
  className?: string;
}

export function CartoonCardSkeleton({ className }: CartoonCardSkeletonProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card shadow-sm",
        className
      )}
    >
      {/* Cover Image Skeleton - matches CartoonCard dimensions exactly */}
      <div className="relative mx-auto h-[250px] w-[180px] sm:w-[180px] overflow-hidden bg-muted">
        <Skeleton className="h-full w-full" />

        {/* Badge placeholders to match CartoonCard structure */}
        {/* Completion Status Badge placeholder (top-left) */}
        <div className="absolute left-2 top-2 z-10">
          <Skeleton className="size-7 rounded-full" />
        </div>

        {/* Age Rate Badge placeholder (top-right) */}
        <div className="absolute right-2 top-2 z-10">
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>

        {/* Title Overlay Skeleton (for mobile/tablet) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 md:hidden">
          <Skeleton className="h-4 w-3/4 bg-white/20" />
        </div>
      </div>

      {/* Content Section Skeleton - matches CartoonCard padding and gap exactly */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title Skeleton (Desktop) */}
        <div className="hidden md:block">
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Author Skeleton - includes verified checkmark placeholder */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="flex min-w-0 items-center gap-1.5">
            <Skeleton className="h-4 w-20" />
            {/* Verified checkmark placeholder */}
            <Skeleton className="size-3.5 shrink-0 rounded-full" />
          </div>
        </div>

        {/* Genres Skeleton - matches Badge dimensions */}
        <div className="flex flex-wrap gap-1.5 min-w-0">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Statistics Skeleton - matches CartoonCard spacing and text size */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Eye className="size-3.5 shrink-0 text-muted-foreground/30" aria-hidden="true" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Heart className="size-3.5 shrink-0 text-muted-foreground/30" aria-hidden="true" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <BookOpen className="size-3.5 shrink-0 text-muted-foreground/30" aria-hidden="true" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
      </div>
    </article>
  );
}
