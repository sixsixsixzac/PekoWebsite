"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { BookOpen } from "lucide-react";
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
import type { NovelReadProps } from "./types";
import { fetchService } from "@/lib/services/fetch-service";

export function NovelRead({ cartoonUuid, episode, buyImmediately = false, userPoints: initialUserPoints = null }: NovelReadProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeInfo, setEpisodeInfo] = useState<{ epName: string; epNo: number } | null>(null);
  const [navigation, setNavigation] = useState<{ prevEpNo: number | null; nextEpNo: number | null } | null>(null);
  const [unlockData, setUnlockData] = useState<{
    episodeInfo: { epId: number; epNo: number; epName: string; epPrice: number };
    navigation: { prevEpNo: number | null; nextEpNo: number | null };
  } | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(initialUserPoints);
  const [cartoonTitle, setCartoonTitle] = useState<string | null>(null);

  // Memoize navigation handler to prevent unnecessary re-renders
  const handleNavigation = useCallback(async (epNo: number | null) => {
    if (epNo === null) return;

    // Check if buyImmediately is enabled and navigating to next episode
    if (buyImmediately && epNo === navigation?.nextEpNo) {
      try {
        // Fetch episode info for the next episode
        try {
          await fetchService.get(`/api/novel/episode/content?cartoonUuid=${cartoonUuid}&episode=${epNo}`);
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
                  await fetchService.post("/api/novel/episode/purchase", {
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
                  router.push(`/novel/${cartoonUuid}/${epNo}`);
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
    router.push(`/novel/${cartoonUuid}/${epNo}`);
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

  const fetchContent = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchService.get<{
        content: string;
        episodeInfo?: { epName: string; epNo: number };
        navigation?: { prevEpNo: number | null; nextEpNo: number | null };
      }>(`/api/novel/episode/content?cartoonUuid=${cartoonUuid}&episode=${episode}`);
      
      setContent(data.content);
      if (data.episodeInfo) {
        setEpisodeInfo(data.episodeInfo);
      }
      if (data.navigation) {
        setNavigation(data.navigation);
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
          return;
        }
      }
      
      const errorMessage = err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
        ? err.message
        : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [cartoonUuid, episode]);

  // Fetch cartoon title
  useEffect(() => {
    const fetchCartoonTitle = async () => {
      try {
        const data = await fetchService.get<{ title: string }>(`/api/cartoon/${cartoonUuid}?type=novel`);
        setCartoonTitle(data.title || null);
      } catch (err) {
        console.error("Failed to fetch cartoon title:", err);
      }
    };

    fetchCartoonTitle();
  }, [cartoonUuid]);

  // Reset and initial load when props change
  useEffect(() => {
    setContent(null);
    setLoading(true);
    setError(null);
    setEpisodeInfo(null);
    setNavigation(null);
    setUnlockData(null);
    
    fetchContent();
  }, [cartoonUuid, episode, fetchContent]);

  // Show unlock component if 403 error with episode info
  if (unlockData) {
    return (
      <div className="max-w-6xl mx-auto">
        <EpisodeUnlock
          cartoonUuid={cartoonUuid}
          episode={episode}
          episodeInfo={unlockData.episodeInfo}
          navigation={unlockData.navigation}
          userPoints={userPoints}
          cartoonType="novel"
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

  if (!content && !loading) {
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
              <BookOpen className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>ไม่พบเนื้อหา</EmptyTitle>
            <EmptyDescription>
              ไม่พบเนื้อหาสำหรับตอนนี้
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

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
                  <Link href={`/novel/${cartoonUuid}`}>{cartoonTitle}</Link>
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

      {/* Show skeleton loader on initial load */}
      {loading && !content && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      )}

      {/* Show actual content */}
      {content && (
        <article className="max-w-6xl mx-auto px-4 md:px-0 py-8">
          <style dangerouslySetInnerHTML={{
            __html: `
              .novel-content * {
                background-color: transparent !important;
              }
            `
          }} />
          <div 
            className="novel-content prose prose-lg dark:prose-invert max-w-none leading-relaxed text-foreground"
            style={{ 
              fontFamily: 'inherit',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      )}

      {/* Episode Footer */}
      <EpisodeFooter
        shareUrl={undefined}
      />
    </div>
  );
}

