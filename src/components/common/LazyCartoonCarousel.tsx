"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CartoonCarousel } from "@/components/common/CartoonCarousel";
import type { SearchFilters, SearchResponse } from "@/lib/types/search";
import type { CartoonCardProps } from "@/components/common/CartoonCard";
import { fetchService } from "@/lib/services/fetch-service";

interface LazyCartoonCarouselProps {
  title?: string;
  filters?: SearchFilters;
  className?: string;
  /** Match server carousel default */
  limit?: number;
}

/**
 * Client-side lazy loaded carousel:
 * - Renders only after it scrolls into view (IntersectionObserver).
 * - Fetches data from /api/cartoon/search to avoid SSR cost.
 * - Helps reduce initial LCP/TBT by not rendering all carousels on first paint.
 */
export function LazyCartoonCarousel({
  title,
  filters,
  className,
  limit = 8,
}: LazyCartoonCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<CartoonCardProps[] | null>(null);
  const [hasRequested, setHasRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchHref = useMemo(() => {
    const params = new URLSearchParams();

    if (filters) {
      const {
        name,
        cartoonType,
        complete_status,
        orderBy,
        mainCategory,
        subCategory,
        age,
        original,
      } = filters;

      if (name) params.set("name", name);
      if (cartoonType && cartoonType !== "all") params.set("cartoonType", cartoonType);
      if (complete_status && complete_status !== "all") params.set("complete_status", complete_status);
      if (orderBy && orderBy !== "relevance") params.set("orderBy", orderBy);
      if (age && age !== "all") params.set("age", age);
      if (original && original !== "all") params.set("original", original);

      if (mainCategory && mainCategory !== "all") {
        if (Array.isArray(mainCategory)) {
          mainCategory.forEach((id) => params.append("mainCategory", id));
        } else {
          params.set("mainCategory", mainCategory);
        }
      }

      if (subCategory && subCategory !== "all") {
        if (Array.isArray(subCategory)) {
          subCategory.forEach((id) => params.append("subCategory", id));
        } else {
          params.set("subCategory", subCategory);
        }
      }
    }

    return params.toString() ? `/search?${params.toString()}` : "/search";
  }, [filters]);

  useEffect(() => {
    if (!containerRef.current || hasRequested) return;

    const target = containerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || hasRequested) return;

        setHasRequested(true);
        setIsLoading(true);

        const params = new URLSearchParams({
          page: "1",
          limit: String(limit),
        });

        if (filters) {
          const {
            name,
            cartoonType,
            complete_status,
            orderBy,
            mainCategory,
            subCategory,
            age,
            original,
          } = filters;

          if (name) params.set("name", name);
          if (cartoonType && cartoonType !== "all") params.set("cartoonType", cartoonType);
          if (complete_status && complete_status !== "all") params.set("complete_status", complete_status);
          if (orderBy && orderBy !== "relevance") params.set("orderBy", orderBy);
          if (age && age !== "all") params.set("age", age);
          if (original && original !== "all") params.set("original", original);

          if (mainCategory && mainCategory !== "all") {
            if (Array.isArray(mainCategory)) {
              mainCategory.forEach((id) => params.append("mainCategory", id));
            } else {
              params.set("mainCategory", mainCategory);
            }
          }

          if (subCategory && subCategory !== "all") {
            if (Array.isArray(subCategory)) {
              subCategory.forEach((id) => params.append("subCategory", id));
            } else {
              params.set("subCategory", subCategory);
            }
          }
        }

        void (async () => {
          try {
            const data = await fetchService.get<SearchResponse>(`/api/cartoon/search?${params.toString()}`);
            setItems(data.data);
          } catch (error) {
            // Silently fail - don't show error for lazy loading
            console.error("Failed to load carousel items:", error);
          } finally {
            setIsLoading(false);
          }
        })();
      },
      {
        root: null,
        rootMargin: "200px 0px", // start loading a bit before it comes into view
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [filters, hasRequested, limit]);

  return (
    <div ref={containerRef} className={className}>
      {items && items.length > 0 ? (
        <CartoonCarousel
          title={title}
          items={items}
          className=""
          totalItems={20}
          searchHref={searchHref}
        />
      ) : (
        // Minimal placeholder to keep layout stable without heavy content
        <section aria-label={title}>
          {title && (
            <header className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
                {title}
              </h2>
            </header>
          )}
          {isLoading && (
            <div className="h-40 w-full rounded-lg bg-muted/40 animate-pulse" />
          )}
        </section>
      )}
    </div>
  );
}


