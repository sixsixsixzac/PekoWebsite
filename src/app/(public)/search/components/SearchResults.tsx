"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CartoonCard, type CartoonCardProps } from "@/components/common/CartoonCard";
import { CartoonCardSkeleton } from "@/components/common/CartoonCardSkeleton";
import { searchCartoons } from "@/lib/api/search";
import type { SearchFilters, SearchParams, SearchResponse } from "@/lib/types/search";
import { TYPE_LABELS } from "@/lib/constants/cartoon.constants";

interface SearchResultsProps {
  filters: SearchFilters;
}

export function SearchResults({ filters }: SearchResultsProps) {
  const [cartoons, setCartoons] = useState<CartoonCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const limit = 20;

  const buildSearchParams = useCallback(
    (page: number): SearchParams => {
      const params: SearchParams = {
        page,
        limit,
        orderBy: filters.orderBy || "views",
      };

      if (filters.name) params.name = filters.name;
      if (filters.cartoonType && filters.cartoonType !== "all") {
        params.cartoonType = filters.cartoonType;
      }
      if (filters.complete_status && filters.complete_status !== "all") {
        params.complete_status = filters.complete_status;
      }
      if (filters.age && filters.age !== "all") {
        params.age = filters.age;
      }
      if (filters.original && filters.original !== "all") {
        params.original = filters.original;
      }
      if (filters.mainCategory && filters.mainCategory !== "all") {
        params.mainCategory = filters.mainCategory;
      }
      if (filters.subCategory && filters.subCategory !== "all") {
        params.subCategory = filters.subCategory;
      }

      return params;
    },
    [filters, limit]
  );

  const fetchCartoons = useCallback(
    async (page: number, append: boolean = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const params = buildSearchParams(page);
        const response: SearchResponse = await searchCartoons(params);

        if (append) {
          setCartoons((prev) => [...prev, ...response.data]);
        } else {
          setCartoons(response.data);
        }

        setHasMore(response.hasMore);
        setTotal(response.total);
        setCurrentPage(page);
      } catch (error) {
        console.error("Failed to fetch cartoons:", error);
        setHasMore(false);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    },
    [buildSearchParams]
  );

  useEffect(() => {
    setIsInitialLoading(true);
    setCartoons([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotal(0);
    isLoadingRef.current = false;
    fetchCartoons(1, false);
  }, [filters, fetchCartoons]);

  const loadMore = useCallback(() => {
    if (!isLoadingRef.current && hasMore && !isLoading) {
      fetchCartoons(currentPage + 1, true);
    }
  }, [hasMore, currentPage, fetchCartoons, isLoading]);

  useEffect(() => {
    if (isInitialLoading || !hasMore || isLoadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isLoadingRef.current && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const trigger = loadMoreTriggerRef.current;
    if (trigger) {
      observer.observe(trigger);
    }

    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, [hasMore, isLoading, loadMore, isInitialLoading]);

  if (isInitialLoading) {
    return (
      <div className="mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <CartoonCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!isInitialLoading && cartoons.length === 0 && !isLoading) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-muted-foreground text-lg">ไม่พบผลลัพธ์</p>
        <p className="text-muted-foreground text-sm mt-2">
          ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง
        </p>
      </div>
    );
  }

  const typeLabel =
    filters.cartoonType && filters.cartoonType !== "all"
      ? TYPE_LABELS[filters.cartoonType] || "มังงะ"
      : "มังงะ";

  return (
    <div className="mt-8">
      {!isInitialLoading && total > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            ค้นหา{typeLabel}({cartoons.length}/{total})
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {cartoons.map((cartoon, index) => (
          <CartoonCard
            key={cartoon.uuid}
            {...cartoon}
            priority={index < 6}
          />
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <CartoonCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div ref={loadMoreTriggerRef} className="h-4 mt-4" aria-hidden="true" />
      )}

      {!hasMore && cartoons.length > 0 && (
        <div className="mt-8 text-center py-4">
          <p className="text-muted-foreground text-sm">แสดงผลลัพธ์ทั้งหมดแล้ว</p>
        </div>
      )}
    </div>
  );
}


