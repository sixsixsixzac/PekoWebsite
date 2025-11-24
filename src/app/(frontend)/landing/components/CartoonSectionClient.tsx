"use client";

import { useEffect, useRef, useState } from "react";
import { fromEventPattern } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CartoonScroller } from "./CartoonScroller";
import type { CartoonCardProps } from "../../../../components/common/CartoonCard";
import type { SearchParams, SearchResponse } from "@/lib/types/search";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { BookOpen } from "lucide-react";

export interface CartoonSectionClientProps {
  title: string;
  subtitle?: string;
  initialData: CartoonCardProps[];
  fetchMore: (params: SearchParams) => Promise<SearchResponse>;
  fetchParams: Omit<SearchParams, "page" | "limit">;
  limit?: number;
  initialHasMore?: boolean;
  className?: string;
  moreHref?: string;
}

/**
 * CartoonSectionClient - Client Component
 * 
 * Wraps CartoonSection with RxJS-based viewport detection.
 * Only triggers fetching when section is in viewport.
 * Pauses ongoing fetches when section leaves viewport.
 */
export function CartoonSectionClient({
  title,
  subtitle,
  initialData,
  fetchMore,
  fetchParams,
  limit = 6,
  initialHasMore = true,
  className,
  moreHref,
}: CartoonSectionClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Create IntersectionObserver using RxJS
    const intersection$ = fromEventPattern<IntersectionObserverEntry[]>(
      (handler) => {
        const observer = new IntersectionObserver(
          (entries) => handler(entries),
          {
            root: null,
            rootMargin: "100px", // Trigger 100px before entering viewport
            threshold: 0.01, // Trigger when at least 1% is visible
          }
        );
        observer.observe(section);
        return observer;
      },
      (handler, observer) => {
        if (observer instanceof IntersectionObserver) {
          observer.disconnect();
        }
      }
    ).pipe(
      map((entries) => entries[0]?.isIntersecting ?? false),
      startWith(false)
    );

    // Subscribe to viewport changes
    const subscription = intersection$.subscribe((inViewport) => {
      setIsInViewport(inViewport);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create a controlled fetch function that respects viewport visibility
  const controlledFetchMore = async (params: SearchParams): Promise<SearchResponse> => {
    // Don't fetch if not in viewport
    if (!isInViewport) {
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || limit,
        hasMore: false,
      };
    }

    // Fetch normally when in viewport
    return fetchMore(params);
  };

  return (
    <section
      ref={sectionRef}
      className={className}
      aria-labelledby={`cartoon-section-${title}`}
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2
            id={`cartoon-section-${title}`}
            className="text-xl font-bold text-foreground md:text-2xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {moreHref && (
          <div className="flex-shrink-0">
            <Button asChild variant="ghost" size="sm">
              <Link href={moreHref}>เพิ่มเติม</Link>
            </Button>
          </div>
        )}
      </div>
      {initialData.length > 0 ? (
        <CartoonScroller
          initialData={initialData}
          fetchMore={controlledFetchMore}
          fetchParams={fetchParams}
          limit={limit}
          initialHasMore={initialHasMore}
          isInViewport={isInViewport}
        />
      ) : (
        <Empty className="min-h-[200px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>ไม่พบข้อมูล</EmptyTitle>
            <EmptyDescription>
              ไม่พบ{title.toLowerCase()}ในขณะนี้
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  );
}

