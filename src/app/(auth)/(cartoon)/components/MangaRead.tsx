"use client";

import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ImageIcon } from "lucide-react";
import { EpisodeUnlock } from "./EpisodeUnlock";
import { EpisodeHeader } from "./EpisodeHeader";
import { EpisodeFooter } from "./EpisodeFooter";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { MangaReadProps } from "./types";
import { fetchService } from "@/lib/services/fetch-service";

// Memoized image component for better performance with error handling
const MangaImage = memo(({ 
  imageUrl, 
  index, 
  onError 
}: { 
  imageUrl: string; 
  index: number;
  onError: (index: number) => void;
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
    onError(index);
  }, [index, onError]);

  if (hasError) {
    return (
      <div className="relative w-full min-h-[400px] flex items-center justify-center">
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="size-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>ไม่พบรูปภาพ</EmptyTitle>
            <EmptyDescription>
              ไม่สามารถโหลดรูปภาพหน้า {index + 1} ได้
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative aspect-auto w-full">
        <Image
          src={imageUrl}
          alt={`Page ${index + 1}`}
          width={1200}
          height={1600}
          className="w-full h-auto object-contain"
          unoptimized
          priority={index < 3}
          onError={handleError}
        />
      </div>
    </div>
  );
});
MangaImage.displayName = "MangaImage";

export function MangaRead({ cartoonUuid, episode, buyImmediately = false, loadFullImages = false, userPoints: initialUserPoints = null }: MangaReadProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [images, setImages] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeInfo, setEpisodeInfo] = useState<{ epName: string; epNo: number } | null>(null);
  const [navigation, setNavigation] = useState<{ prevEpNo: number | null; nextEpNo: number | null } | null>(null);
  const [unlockData, setUnlockData] = useState<{
    episodeInfo: { epId: number; epNo: number; epName: string; epPrice: number };
    navigation: { prevEpNo: number | null; nextEpNo: number | null };
  } | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(initialUserPoints);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [cartoonTitle, setCartoonTitle] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(1);
  const fetchingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle image load errors
  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  }, []);

  // Handle page jump
  const handlePageJump = useCallback((page: number) => {
    const targetIndex = page - 1;
    if (targetIndex >= 0 && targetIndex < images.length) {
      const targetElement = imageRefs.current[targetIndex];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        setCurrentPageIndex(page);
      }
    }
  }, [images.length]);

  // Track current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (let i = 0; i < imageRefs.current.length; i++) {
        const element = imageRefs.current[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setCurrentPageIndex(i + 1);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [images.length]);

  // Memoize navigation handler to prevent unnecessary re-renders
  const handleNavigation = useCallback(async (epNo: number | null) => {
    if (epNo === null) return;

    // Check if buyImmediately is enabled and navigating to next episode
    if (buyImmediately && epNo === navigation?.nextEpNo) {
      try {
        // Fetch episode info for the next episode
        try {
          await fetchService.get(`/api/manga/episode/images?cartoonUuid=${cartoonUuid}&episode=${epNo}&page=1&limit=1`);
        } catch (error: unknown) {
          // Check if it's a 403 error with episode info
          if (error && typeof error === 'object' && 'status' in error && error.status === 403 && 'data' in error) {
            const errorData = error.data as { episodeInfo?: { epId: number; epNo: number; epPrice: number } };
            
            if (errorData?.episodeInfo) {
              const nextEpisodeInfo = errorData.episodeInfo;
              
              // Check if user has enough points
              if (userPoints !== null && userPoints >= nextEpisodeInfo.epPrice) {
                // Auto-purchase the episode
                try {
                  await fetchService.post("/api/manga/episode/purchase", {
                    cartoonUuid,
                    episode: nextEpisodeInfo.epNo,
                    epId: nextEpisodeInfo.epId,
                  });

                  // Refresh user points from server
                  try {
                    const pointsData = await fetchService.get<{ points: number }>("/api/user/points");
                    setUserPoints(pointsData.points);
                  } catch (err) {
                    console.error("Failed to refresh points:", err);
                    // Fallback to calculated points
                    setUserPoints(prev => prev !== null ? prev - nextEpisodeInfo.epPrice : null);
                  }
                  
                  // Show success notification
                  toast.success(`ซื้อตอนที่ ${nextEpisodeInfo.epNo} สำเร็จ`, {
                    description: `ใช้ ${nextEpisodeInfo.epPrice.toLocaleString()} พอยต์`,
                  });
                  
                  // Navigate to the episode - use new route structure
                  router.push(`/manga/${cartoonUuid}/${epNo}`);
                  return;
                } catch (purchaseError: unknown) {
                  const errorMsg = purchaseError && typeof purchaseError === 'object' && 'data' in purchaseError
                    ? (purchaseError.data as { error?: string })?.error
                    : "ไม่สามารถซื้อตอนได้";
                  toast.error(errorMsg || "ไม่สามารถซื้อตอนได้");
                }
              } else {
                // Not enough points, show unlock component
                toast.warning("พอยต์ไม่เพียงพอ", {
                  description: `ต้องการ ${nextEpisodeInfo.epPrice.toLocaleString()} พอยต์ แต่คุณมี ${userPoints?.toLocaleString() || 0} พอยต์`,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Error in auto-purchase:", err);
        toast.error("เกิดข้อผิดพลาดในการซื้ออัตโนมัติ");
      }
    }

    // Navigate normally if auto-purchase didn't happen or failed
    router.push(`/manga/${cartoonUuid}/${epNo}`);
  }, [buyImmediately, navigation, userPoints, cartoonUuid, router]);

  // Check for auto-purchase notification on mount
  useEffect(() => {
    const autoPurchased = searchParams.get("autoPurchased");
    const autoPurchaseFailed = searchParams.get("autoPurchaseFailed");
    const epPrice = searchParams.get("epPrice");
    const epNo = searchParams.get("epNo");
    const error = searchParams.get("error");

    if (autoPurchased === "true" && epPrice && epNo) {
      toast.success(`ซื้อตอนที่ ${epNo} สำเร็จ`, {
        description: `ใช้ ${parseInt(epPrice).toLocaleString()} พอยต์`,
      });

      // Clean up URL by removing query parameters
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    } else if (autoPurchaseFailed === "true") {
      toast.error("ไม่สามารถซื้ออัตโนมัติได้", {
        description: error ? decodeURIComponent(error) : "เกิดข้อผิดพลาดในการซื้ออัตโนมัติ",
      });

      // Clean up URL by removing query parameters
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const fetchImages = useCallback(async (pageNum: number, limit?: number): Promise<void> => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchService.get<{
        images: string[];
        hasMore: boolean;
        episodeInfo?: { epName: string; epNo: number };
        navigation?: { prevEpNo: number | null; nextEpNo: number | null };
      }>(`/api/manga/episode/images?cartoonUuid=${cartoonUuid}&episode=${episode}&page=${pageNum}&limit=${limit ?? 1}`);
      
      if (pageNum === 1) {
        setImages(data.images);
        if (data.episodeInfo) {
          setEpisodeInfo(data.episodeInfo);
        }
        if (data.navigation) {
          setNavigation(data.navigation);
        }
        // If loading all images, set hasMore to false
        if (limit && limit > 1) {
          setHasMore(false);
        } else {
          setHasMore(data.hasMore);
        }
      } else {
        setImages((prev) => [...prev, ...data.images]);
        setHasMore(data.hasMore);
      }
    } catch (err: unknown) {
      // Check if it's a 403 error with episode info
      if (err && typeof err === 'object' && 'status' in err && err.status === 403 && 'data' in err) {
        const errorData = err.data as {
          episodeInfo?: { epId: number; epNo: number; epName: string; epPrice: number };
          navigation?: { prevEpNo: number | null; nextEpNo: number | null };
        };
        
        if (errorData.episodeInfo && errorData.navigation) {
          setUnlockData({
            episodeInfo: errorData.episodeInfo,
            navigation: errorData.navigation,
          });
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
      }
      
      const errorMessage = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [cartoonUuid, episode]);


  // Fetch cartoon title
  useEffect(() => {
    const fetchCartoonTitle = async () => {
      try {
        // Determine type from pathname - check for new route structure
        const type = pathname.includes("/novel/") ? "novel" : "manga";
        const data = await fetchService.get<{ title: string }>(`/api/cartoon/${cartoonUuid}?type=${type}`);
        setCartoonTitle(data.title || null);
      } catch (err) {
        console.error("Failed to fetch cartoon title:", err);
      }
    };

    fetchCartoonTitle();
  }, [cartoonUuid, pathname]);

  // Reset and initial load when props change
  useEffect(() => {
    currentPageRef.current = 1;
    setImages([]);
    setHasMore(true);
    fetchingRef.current = false;
    setLoading(true);
    setError(null);
    setEpisodeInfo(null);
    setNavigation(null);
    setUnlockData(null);
    setFailedImages(new Set());
    
    // Load all images at once if loadFullImages is enabled, otherwise use pagination
    // Use a large limit (10000) when loadFullImages is true to fetch all images in one request
    fetchImages(1, loadFullImages ? 10000 : undefined);
  }, [cartoonUuid, episode, loadFullImages, fetchImages]);

  // Set up Intersection Observer for infinite scroll (only when loadFullImages is false)
  useEffect(() => {
    // Disable infinite scroll if loadFullImages is enabled
    if (loadFullImages) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return;
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !loading && !fetchingRef.current) {
          currentPageRef.current += 1;
          fetchImages(currentPageRef.current);
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, fetchImages, loadFullImages]);

  // Show unlock component if 403 error with episode info
  if (unlockData) {
    return (
      <div className="max-w-6xl mx-auto">
        <EpisodeUnlock
          cartoonUuid={cartoonUuid}
          episode={episode}
          episodeInfo={unlockData.episodeInfo}
          navigation={unlockData.navigation}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error: {error}
      </div>
    );
  }

  if (images.length === 0 && !loading) {
    return (
      <div className="space-y-4">
        <EpisodeHeader
          episodeInfo={episodeInfo}
          navigation={navigation}
          onNavigate={handleNavigation}
          isLoading={false}
        />
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>ไม่พบรูปภาพ</EmptyTitle>
            <EmptyDescription>
              ไม่พบรูปภาพสำหรับตอนนี้
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // Memoize skeleton loaders
  const skeletonLoaders = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, index) => (
        <div key={`skeleton-initial-${index}`} className="relative w-full">
          <div className="relative aspect-[3/4] w-full bg-muted rounded-md overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      )),
    []
  );

  const moreSkeletonLoaders = useMemo(
    () =>
      Array.from({ length: 2 }).map((_, index) => (
        <div key={`skeleton-more-${index}`} className="relative w-full">
          <div className="relative aspect-[3/4] w-full bg-muted rounded-md overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      )),
    []
  );

  // Determine cartoon type from pathname
  const cartoonType = pathname.includes("/novel/") ? "novel" : "manga";
  const cartoonTypeLabel = cartoonType === "novel" ? "นิยาย" : "มังงะ";
  const cartoonTypePath = cartoonType === "novel" ? "/novel" : "/manga";

  return (
    <div className="space-y-4">
      <EpisodeHeader
        episodeInfo={episodeInfo}
        navigation={navigation}
        onNavigate={handleNavigation}
        isLoading={loading && !episodeInfo}
      />

      {/* Breadcrumb */}
      <Breadcrumb className="px-4 md:px-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">หน้าหลัก</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {cartoonTitle ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`${cartoonTypePath}/${cartoonUuid}`}>{cartoonTitle}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>
              {episodeInfo ? `ตอนที่ ${episodeInfo.epNo}` : `ตอนที่ ${episode}`}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Show skeleton loaders on initial load */}
      {loading && images.length === 0 && skeletonLoaders}

      {/* Show actual images */}
      {images.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          ref={(el) => {
            imageRefs.current[index] = el;
          }}
        >
        <MangaImage 
          imageUrl={imageUrl} 
          index={index}
          onError={handleImageError}
        />
        </div>
      ))}
      
      {/* Show skeleton loaders when loading more images */}
      {loading && images.length > 0 && moreSkeletonLoaders}
      
      {/* Sentinel element for intersection observer */}
      {hasMore && (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      )}

      {/* Episode Footer */}
      <EpisodeFooter
        totalPages={images.length}
        currentPage={currentPageIndex}
        onPageJump={handlePageJump}
        shareUrl={undefined}
      />
    </div>
  );
}

