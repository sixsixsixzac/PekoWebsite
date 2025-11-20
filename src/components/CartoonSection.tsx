"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Virtual } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CartoonCard, type CartoonCardProps } from "./CartoonCard";
import { CartoonCardSkeleton } from "./CartoonCardSkeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import mockupData from "@/data/mockupCartoon.json";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface CartoonSectionProps {
  title: string;
  description?: string;
  cartoonType: "manga" | "novel";
  type: string; // e.g., "popular", "latest", "trending" - backend handles ordering logic
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

export function CartoonSection({
  title,
  description,
  cartoonType,
  type,
  itemsPerView = {
    mobile: 2,
    tablet: 3,
    desktop: 5,
  },
  className,
}: CartoonSectionProps) {
  // Fetch data based on cartoonType and type
  // Backend handles ordering logic based on type
  const [items, setItems] = useState<CartoonCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/cartoons?cartoonType=${cartoonType}&type=${type}`)
    // const data = await response.json()
    
    const fetchData = async () => {
      setIsLoading(true);
      
      // For now, use mockup data and simulate backend ordering logic
      const rawData = mockupData[cartoonType] as CartoonCardProps[];
      
      // Simulate backend ordering based on type
      // In production, this logic will be handled by the backend
      let sortedData = [...rawData];
      switch (type) {
        case "popular":
          sortedData.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case "latest":
          sortedData.sort((a, b) => parseInt(b.id) - parseInt(a.id));
          break;
        case "trending":
          sortedData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        default:
          // Default to views if type is not recognized
          sortedData.sort((a, b) => (b.views || 0) - (a.views || 0));
      }
      
      setItems(sortedData);
      setIsLoading(false);
    };

    fetchData();
  }, [cartoonType, type]);

  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  // Initialize with empty set - skeletons will show until items are loaded
  const [loadedItems, setLoadedItems] = useState<Set<number>>(new Set());
  // Initialize with desktop value to avoid hydration mismatch
  const [currentItemsPerView, setCurrentItemsPerView] = useState(
    itemsPerView.desktop ?? 5
  );
  const [isMounted, setIsMounted] = useState(false);

  // RxJS observables for lazy loading management
  const activeIndex$ = useMemo(() => new BehaviorSubject<number>(0), []);
  const itemsPerView$ = useMemo(
    () =>
      new BehaviorSubject<number>(
        typeof window !== "undefined"
          ? window.innerWidth >= 1024
            ? itemsPerView.desktop ?? 5
            : window.innerWidth >= 768
              ? itemsPerView.tablet ?? 3
              : 2.5 // Mobile shows 2.5 items
          : itemsPerView.desktop ?? 5
      ),
    [itemsPerView]
  );

  // Calculate which items should be loaded based on active index and items per view
  const visibleRange$ = useMemo(
    () =>
      combineLatest([activeIndex$, itemsPerView$]).pipe(
        map(([index, perView]) => {
          const maxIndex = items.length > 0 ? items.length - 1 : 0;
          const start = Math.max(0, index - 1); // Load one before
          const end = Math.min(maxIndex, index + perView + 1); // Load one after
          return { start, end };
        })
      ),
    [activeIndex$, itemsPerView$, items.length]
  );

  // Subscribe to visible range changes and update loaded items
  useEffect(() => {
    const subscription = visibleRange$.subscribe((range) => {
      setLoadedItems((prev) => {
        // Check if we need to update at all
        let needsUpdate = false;
        for (let i = range.start; i <= range.end; i++) {
          if (!prev.has(i)) {
            needsUpdate = true;
            break;
          }
        }
        
        if (!needsUpdate) return prev; // Return same reference to avoid re-render
        
        const newSet = new Set(prev);
        for (let i = range.start; i <= range.end; i++) {
          if (!prev.has(i)) {
            newSet.add(i);
          }
        }
        return newSet;
      });
    });

    return () => subscription.unsubscribe();
  }, [visibleRange$]);

  // Pre-load initial items immediately after mount
  useEffect(() => {
    if (!isMounted || items.length === 0) return;
    
    // Small delay to ensure skeletons show first, then load items
    const timer = setTimeout(() => {
      // Calculate initial visible range based on current viewport
      const width = typeof window !== "undefined" ? window.innerWidth : 1024;
      const initialPerView =
        width >= 1024
          ? itemsPerView.desktop ?? 5
          : width >= 768
            ? itemsPerView.tablet ?? 3
            : 2.5;
      
      const initialRange = {
        start: 0,
        end: Math.min(items.length - 1, Math.ceil(initialPerView) + 1),
      };
      
      // Mark initial items as loaded
      setLoadedItems((prev) => {
        const newSet = new Set(prev);
        for (let i = initialRange.start; i <= initialRange.end; i++) {
          newSet.add(i);
        }
        return newSet;
      });
    }, 100); // Small delay to show skeletons first
    
    return () => clearTimeout(timer);
  }, [isMounted, items.length, itemsPerView]);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle window resize to update items per view
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const perView =
        width >= 1024
          ? itemsPerView.desktop ?? 5
          : width >= 768
            ? itemsPerView.tablet ?? 3
            : 2.5; // Mobile shows 2.5 items
      setCurrentItemsPerView(perView);
      itemsPerView$.next(perView);
    };

    // Initial calculation
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [itemsPerView, itemsPerView$, isMounted]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex((prev) => {
      if (prev === newIndex) return prev; // Avoid unnecessary update
      return newIndex;
    });
    activeIndex$.next(newIndex);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, [activeIndex$]);

  const handleSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  // Update Swiper when items change
  useEffect(() => {
    if (swiperRef.current && !isLoading && items.length > 0) {
      swiperRef.current.update();
      swiperRef.current.updateSlides();
      swiperRef.current.updateSlidesClasses();
    }
  }, [items, isLoading]);

  const slidePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const slideNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  // Calculate total slides based on current viewport
  // For mobile (2.5 per view), we use slidesPerGroup (2) for calculation
  const mobilePerGroup = 2;
  const isMobile = isMounted && typeof window !== "undefined" && window.innerWidth < 768;
  const itemsCount = isLoading || items.length === 0 ? (itemsPerView.desktop ?? 5) : items.length;
  const totalSlides = isMobile
    ? Math.ceil(itemsCount / mobilePerGroup)
    : Math.ceil(itemsCount / currentItemsPerView);

  return (
    <section className={cn("relative", className)}>
      {/* Custom Swiper Pagination Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .swiper-pagination {
            display: none !important;
          }
          
          @media (min-width: 768px) {
            .swiper-pagination {
              display: flex !important;
              cursor: pointer !important;
            }
            
            .swiper-pagination-bullet {
              background: var(--muted-foreground) !important;
              opacity: 0.4 !important;
              width: 8px !important;
              height: 8px !important;
              transition: all 0.3s ease !important;
              cursor: pointer !important;
            }
            
            .swiper-pagination-bullet-active {
              background: var(--primary) !important;
              opacity: 1 !important;
              width: 24px !important;
              border-radius: 4px !important;
              cursor: pointer !important;
            }
            
            .swiper-pagination-bullet:hover {
              opacity: 0.6 !important;
              cursor: pointer !important;
            }
            
            .swiper-pagination-bullet-active:hover {
              background: var(--primary) !important;
              opacity: 1 !important;
              cursor: pointer !important;
            }
          }
        `
      }} />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Desktop Navigation Buttons */}
        <div className="hidden md:block">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 rounded-full h-10 w-10 cursor-pointer"
            onClick={slidePrev}
            disabled={isBeginning}
            aria-label="Previous slides"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 rounded-full h-10 w-10 cursor-pointer"
            onClick={slideNext}
            disabled={isEnd}
            aria-label="Next slides"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination, Virtual]}
          spaceBetween={16}
          slidesPerView={2.5}
          slidesPerGroup={2}
          breakpoints={{
            640: {
              slidesPerView: 2.5,
              slidesPerGroup: 2,
            },
            768: {
              slidesPerView: itemsPerView.tablet ?? 3,
              slidesPerGroup: itemsPerView.tablet ?? 3,
            },
            1024: {
              slidesPerView: itemsPerView.desktop ?? 5,
              slidesPerGroup: itemsPerView.desktop ?? 5,
            },
          }}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          speed={300}
          resistance={true}
          resistanceRatio={0.85}
          virtual={{
            enabled: true,
            addSlidesBefore: 2,
            addSlidesAfter: 2,
          }}
          freeMode={false}
          updateOnWindowResize={true}
          observer={true}
          observeParents={true}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            renderBullet: (index: number, className: string) => {
              return `<span class="${className}" style="cursor: pointer;"></span>`;
            },
          }}
          className="!pb-10 md:!pb-10 !pb-4"
          key={`swiper-${items.length}-${isLoading}`}
        >
          {isLoading || items.length === 0 ? (
            // Show skeletons while loading
            Array.from({ length: itemsPerView.desktop ?? 5 }).map((_, index) => (
              <SwiperSlide key={`skeleton-${index}`} virtualIndex={index}>
                <CartoonCardSkeleton />
              </SwiperSlide>
            ))
          ) : (
            items.map((item, index) => {
              const isLoaded = loadedItems.has(index);
              
              return (
                <SwiperSlide key={item.id} virtualIndex={index}>
                  {isLoaded ? (
                    <CartoonCard
                      {...item}
                      priority={index < (itemsPerView.desktop ?? 5)}
                    />
                  ) : (
                    <CartoonCardSkeleton />
                  )}
                </SwiperSlide>
              );
            })
          )}
        </Swiper>

        {/* Mobile Scroll Indicators */}
        <div className="md:hidden flex justify-center gap-1.5 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => {
            const mobilePerGroup = 2; // slidesPerGroup for mobile (2 items snap at a time)
            // Calculate which page we're on based on activeIndex
            // Since we show 2.5 items but snap 2 at a time, we use floor division
            // This ensures correct page calculation when activeIndex is between groups
            const currentPage = Math.floor(activeIndex / mobilePerGroup);
            const isActive = currentPage === index;
            
            return (
              <button
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isActive
                    ? "w-8 bg-primary"
                    : "w-1.5 bg-muted"
                )}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => {
                  const targetIndex = index * mobilePerGroup;
                  swiperRef.current?.slideTo(targetIndex);
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

