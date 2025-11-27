/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CartoonCard, type CartoonCardProps } from "@/components/common/CartoonCard";
import { CartoonCardSkeleton } from "@/components/common/CartoonCardSkeleton";
import type { SearchResponse } from "@/lib/types/search";
import { fetchService } from "@/lib/services/fetch-service";

type CartoonCarouselProps = {
  title?: string;
  items: CartoonCardProps[];
  /** Optional className for the outer wrapper */
  className?: string;
  /** Target maximum number of items to load (including lazy-loaded ones) */
  totalItems?: number;
  /** Optional href for the "เพิ่มเติม" (See more) link */
  searchHref?: string;
};

export function CartoonCarousel({
  title,
  items,
  className,
  totalItems = 20,
  searchHref,
}: CartoonCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [allItems, setAllItems] = useState<CartoonCardProps[]>(items);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Used to avoid spamming loadMore when the user keeps nudging the carousel at the end.
  const lastLoadMoreTriggerRef = useRef<number>(0);

  // Keep local items in sync with props (e.g. when SSR provides new data)
  useEffect(() => {
    setAllItems(items);
    setPage(1);
    setHasMore(true);
  }, [items]);

  const slides = useMemo(() => allItems, [allItems]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    // How many more items we are allowed to load in total (respect totalItems)
    const remainingAllowed =
      typeof totalItems === "number" ? Math.max(totalItems - allItems.length, 0) : undefined;

    if (remainingAllowed !== undefined && remainingAllowed <= 0) {
      setHasMore(false);
      return;
    }

    const basePerPage = items.length || 6;
    // Request size is capped by remainingAllowed so we never ask for more than totalItems
    const requestLimit =
      remainingAllowed !== undefined ? Math.min(basePerPage, remainingAllowed) : basePerPage;

    const nextPage = page + 1;

    try {
      setIsLoadingMore(true);

      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(requestLimit),
      });

      try {
        const data = await fetchService.get<SearchResponse>(`/api/cartoon/search?${params.toString()}`);

        setAllItems((prev) => {
        const existing = new Set(prev.map((item) => item.uuid));
        const newItems = data.data.filter((item: CartoonCardProps) => !existing.has(item.uuid));
        let combined = newItems.length ? [...prev, ...newItems] : prev;

        if (typeof totalItems === "number" && combined.length >= totalItems) {
          combined = combined.slice(0, totalItems);
          setHasMore(false);
        } else if (!data.hasMore) {
          setHasMore(false);
        }

        return combined;
      });

        setPage(nextPage);
      } catch (error) {
        // Silently fail - don't show error for pagination
        console.error("Failed to load more items:", error);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [allItems.length, hasMore, isLoadingMore, items.length, page, totalItems]);

  // When user reaches the end of the carousel, trigger a debounced loadMore.
  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      // Treat it as "user has scrolled" only after we've moved past the first snap.
      const hasMovedFromStart = carouselApi.selectedScrollSnap() > 0;
      const atEnd = !carouselApi.canScrollNext();

      if (!hasMovedFromStart || !atEnd) return;

      // Basic throttle: at most once every 250ms while we still can load more.
      const now = Date.now();
      if (
        now - lastLoadMoreTriggerRef.current < 250 ||
        !hasMore ||
        isLoadingMore ||
        (typeof totalItems === "number" && allItems.length >= totalItems)
      ) {
        return;
      }

      lastLoadMoreTriggerRef.current = now;
      void loadMore();
    };

    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi, allItems.length, hasMore, isLoadingMore, loadMore, totalItems]);

  if (!slides.length) return null;

  return (
    <section className={className} aria-label={title || "แนะนำการ์ตูน"}>
      {title && (
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
            {title}
          </h2>
          {searchHref && (
            <Link
              href={searchHref}
              className="text-sm font-medium text-primary hover:underline"
            >
              เพิ่มเติม
            </Link>
          )}
        </header>
      )}

      <div className="relative">
        <Carousel
          className="w-full"
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: false,
            // Mobile / touch: follow finger and stop where you release
            dragFree: true,
            skipSnaps: true,
            slidesToScroll: 1,
            // Desktop / tablet: buttons jump a smaller number of items to reduce per-scroll work
            breakpoints: {
              "(min-width: 768px)": {
                dragFree: false,
                skipSnaps: false,
                slidesToScroll: 3,
              },
            },
            containScroll: "trimSnaps",
          }}
        >
          <CarouselContent className="md:-ml-3 lg:-ml-4">
            {slides.map((item) => (
              <CarouselItem
                key={item.uuid}
                className="pl-2 xs:pl-3 sm:pl-3 md:pl-3 lg:pl-4 basis-[47%] sm:basis-[32%] md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
              >
                <CartoonCard {...item} className="h-full" />
              </CarouselItem>
            ))}

            {isLoadingMore &&
              // Show a few skeletons at the end while fetching more
              Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem
                  key={`skeleton-${index}`}
                  className="pl-2 xs:pl-3 sm:pl-3 md:pl-3 lg:pl-4 basis-[47%] sm:basis-[32%] md:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                  aria-hidden="true"
                >
                  <CartoonCardSkeleton className="h-full" />
                </CarouselItem>
              ))}
          </CarouselContent>

          {/* Desktop / tablet navigation buttons */}
          <div className="pointer-events-none hidden md:block">
            <CarouselPrevious className="pointer-events-auto hidden md:flex" />
            <CarouselNext className="pointer-events-auto hidden md:flex" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
