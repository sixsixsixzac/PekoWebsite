"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, ShoppingCart, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { EpisodeHeader } from "./EpisodeHeader";
import type { EpisodeUnlockProps } from "./types";

export function EpisodeUnlock({ cartoonUuid, episode, episodeInfo, navigation, userPoints: initialUserPoints, cartoonType = "manga" }: EpisodeUnlockProps) {
  const router = useRouter();
  const [userPoints, setUserPoints] = useState<number | null>(initialUserPoints ?? null);
  const [loading, setLoading] = useState(initialUserPoints === undefined);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePath = cartoonType === "novel" ? "/novel" : "/manga";
  const purchaseApiPath = cartoonType === "novel" ? "/api/novel/episode/purchase" : "/api/manga/episode/purchase";

  const handleNavigation = useCallback((epNo: number | null) => {
    if (epNo !== null) {
      router.push(`${basePath}/${cartoonUuid}/${epNo}`);
    }
  }, [router, cartoonUuid, basePath]);

  useEffect(() => {
    // Only fetch if not provided as prop
    if (initialUserPoints === undefined) {
      const fetchUserPoints = async () => {
        try {
          const response = await fetch("/api/user/points");
          if (response.ok) {
            const data = await response.json();
            setUserPoints(data.points);
          }
        } catch (err) {
          console.error("Failed to fetch user points:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserPoints();
    } else {
      setLoading(false);
    }
  }, [initialUserPoints]);

  const hasEnoughPoints = useMemo(
    () => userPoints !== null && userPoints >= episodeInfo.epPrice,
    [userPoints, episodeInfo.epPrice]
  );

  const handleUnlock = useCallback(async () => {
    if (!hasEnoughPoints) {
      setError("คุณมีพอยต์ไม่เพียงพอ");
      return;
    }

    setPurchasing(true);
    setError(null);

    try {
      const response = await fetch(purchaseApiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartoonUuid,
          episode: episodeInfo.epNo,
          epId: episodeInfo.epId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to purchase episode");
      }

      // Refresh the page to show the unlocked episode
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการซื้อ");
      setPurchasing(false);
    }
  }, [hasEnoughPoints, cartoonUuid, episodeInfo, purchaseApiPath]);

  const handleBack = useCallback(() => {
    router.push(`${basePath}/${cartoonUuid}`);
  }, [router, cartoonUuid, basePath]);

  return (
    <div className="space-y-4">
      <EpisodeHeader
        episodeInfo={{ epName: episodeInfo.epName, epNo: episodeInfo.epNo }}
        navigation={navigation}
        onNavigate={handleNavigation}
      />

      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md space-y-6 p-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">ตอนที่ {episodeInfo.epNo}</h2>
              <p className="text-lg text-muted-foreground">{episodeInfo.epName}</p>
            </div>

          <div className="w-full space-y-4 pt-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">ราคา:</span>
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                <span>{episodeInfo.epPrice.toLocaleString()}</span>
                <FontAwesomeIcon icon={faCoins} className="h-4 w-4" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">พอยต์ของคุณ:</span>
                <Skeleton className="h-5 w-20" />
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">พอยต์ของคุณ:</span>
                <div className="flex items-center gap-2 font-semibold">
                  <span className={hasEnoughPoints ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {userPoints !== null ? userPoints.toLocaleString() : "0"}
                  </span>
                  <FontAwesomeIcon icon={faCoins} className="h-4 w-4" />
                </div>
              </div>
            )}

            {userPoints !== null && !hasEnoughPoints && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  คุณมีพอยต์ไม่เพียงพอ ต้องการอีก {((episodeInfo.epPrice - userPoints).toLocaleString())} พอยต์
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          <div className="flex w-full gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              disabled={purchasing}
            >
              กลับ
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!hasEnoughPoints || purchasing || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังซื้อ...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  ปลดล็อกตอน
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}

