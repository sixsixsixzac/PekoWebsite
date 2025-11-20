import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CartoonCardSkeletonProps {
  className?: string;
}

export function CartoonCardSkeleton({ className }: CartoonCardSkeletonProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg bg-card shadow-sm",
        className
      )}
    >
      {/* Cover Image Skeleton */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Section Skeleton */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title Skeleton */}
        <div className="hidden md:block">
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Author Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Genres Skeleton */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Statistics Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </article>
  );
}


