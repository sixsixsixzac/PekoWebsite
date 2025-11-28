"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clock, ChevronDown, ShoppingCart, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { fetchService } from "@/lib/services/fetch-service";
import { from, of } from "rxjs";
import { catchError, tap, finalize } from "rxjs/operators";
import { toast } from "sonner";

interface Episode {
  uuid: string;
  number: number;
  title: string;
  price: number;
  isOwned?: boolean;
  lockAfterDatetime?: Date | string | null;
}

interface CartoonEpisodeListProps {
  episodes: Episode[];
  type: "manga" | "novel";
  uuid?: string;
  totalEpisodes: number;
  checkedEpisodes?: Set<string>;
  onCheckedEpisodesChange?: (checked: Set<string>) => void;
  userPoints?: number;
}

export function CartoonEpisodeList({ 
  episodes: initialEpisodes, 
  type, 
  uuid,
  totalEpisodes,
  checkedEpisodes: externalCheckedEpisodes,
  onCheckedEpisodesChange,
  userPoints: propUserPoints
}: CartoonEpisodeListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;
  const [internalCheckedEpisodes, setInternalCheckedEpisodes] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(propUserPoints ?? null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const purchaseSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  // Local state for episodes to update ownership after purchase
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);

  // Update episodes when initialEpisodes prop changes
  useEffect(() => {
    setEpisodes(initialEpisodes);
  }, [initialEpisodes]);

  // Fetch user points if not provided as prop
  useEffect(() => {
    if (isLoggedIn && propUserPoints === undefined && session?.user?.id) {
      const fetchUserPoints = async () => {
        try {
          const data = await fetchService.get<{ points: number }>("/api/user/points");
          setUserPoints(data.points ?? 0);
        } catch (error) {
          console.error("Failed to fetch user points:", error);
          setUserPoints(0);
        }
      };
      fetchUserPoints();
    } else if (propUserPoints !== undefined) {
      setUserPoints(propUserPoints);
    }
  }, [isLoggedIn, propUserPoints, session?.user?.id]);
  
  // Use external state if provided, otherwise use internal state
  const checkedEpisodes = externalCheckedEpisodes ?? internalCheckedEpisodes;
  const updateCheckedEpisodes = (updater: (prev: Set<string>) => Set<string>) => {
    const newSet = updater(checkedEpisodes);
    if (onCheckedEpisodesChange) {
      onCheckedEpisodesChange(newSet);
    } else {
      setInternalCheckedEpisodes(newSet);
    }
  };

  // Sort episodes in descending order and group by 50 (max 50 per group)
  // Fill groups starting from the last group (lowest episode numbers) backwards
  const groupedEpisodes = useMemo(() => {
    const sorted = [...episodes].sort((a, b) => b.number - a.number);
    const groups: Episode[][] = [];
    
    // Start from the end of the array (lowest episode numbers) and work backwards
    // This ensures the last group (lowest numbers) gets filled first
    let remaining = sorted.length;
    let currentIndex = sorted.length;
    
    while (remaining > 0) {
      const groupSize = Math.min(50, remaining);
      const startIndex = currentIndex - groupSize;
      groups.unshift(sorted.slice(startIndex, currentIndex));
      currentIndex = startIndex;
      remaining -= groupSize;
    }
    
    return groups;
  }, [episodes]);

  // Expand all groups by default when groupedEpisodes changes
  useEffect(() => {
    if (groupedEpisodes.length > 0 && openGroups.size === 0) {
      const allGroups = new Set<number>();
      for (let i = 0; i < groupedEpisodes.length; i++) {
        allGroups.add(i);
      }
      setOpenGroups(allGroups);
    }
  }, [groupedEpisodes, openGroups.size]);

  // Calculate selected episodes for purchase (not owned, not free, checked)
  // Sorted by episode number in descending order
  const selectedEpisodesForPurchase = useMemo(() => {
    return episodes
      .filter(
        (ep) => checkedEpisodes.has(ep.uuid) && !ep.isOwned && ep.price > 0
      )
      .sort((a, b) => b.number - a.number);
  }, [episodes, checkedEpisodes]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selectedEpisodesForPurchase.reduce((sum, ep) => sum + ep.price, 0);
  }, [selectedEpisodesForPurchase]);

  // Calculate remaining points after purchase
  const remainingPoints = useMemo(() => {
    if (userPoints === null) return null;
    return userPoints - totalPrice;
  }, [userPoints, totalPrice]);

  // Check if user has enough points
  const hasEnoughPoints = useMemo(() => {
    if (userPoints === null) return false;
    return userPoints >= totalPrice;
  }, [userPoints, totalPrice]);

  const handleBuyClick = () => {
    if (selectedEpisodesForPurchase.length > 0) {
      setBuyDialogOpen(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (selectedEpisodesForPurchase.length === 0 || !hasEnoughPoints || isPurchasing) {
      return;
    }

    const episodeUuids = selectedEpisodesForPurchase.map((ep) => ep.uuid);
    
    setIsPurchasing(true);

    // Create observable from fetch service promise
    const purchaseObservable = from(
      fetchService.post<{ success: boolean; message?: string; error?: string }>(
        "/api/episodes/purchase",
        { episodeUuids }
      )
    ).pipe(
      // Handle successful purchase
      tap((response) => {
        if (response.success) {
          toast.success(response.message || "ซื้อตอนสำเร็จ", {
            description: `ซื้อ ${selectedEpisodesForPurchase.length} ตอนเรียบร้อย`,
          });

          // Update episodes to mark purchased ones as owned
          setEpisodes((prevEpisodes) => {
            const purchasedUuids = new Set(episodeUuids);
            return prevEpisodes.map((ep) => {
              if (purchasedUuids.has(ep.uuid)) {
                return {
                  ...ep,
                  isOwned: true,
                  lockAfterDatetime: null, // Permanent ownership
                };
              }
              return ep;
            });
          });

          // Update user points after successful purchase
          const newPoints = userPoints !== null ? userPoints - totalPrice : null;
          setUserPoints(newPoints);

          // Clear checked episodes
          updateCheckedEpisodes(() => new Set());

          // Close dialog
          setBuyDialogOpen(false);

          // Refresh user points from server to ensure accuracy
          if (isLoggedIn && session?.user?.id) {
            fetchService
              .get<{ points: number }>("/api/user/points")
              .then((data) => {
                setUserPoints(data.points ?? 0);
              })
              .catch((error) => {
                console.error("Failed to refresh user points:", error);
              });
          }
        } else {
          toast.error(response.error || "เกิดข้อผิดพลาดในการซื้อ");
        }
      }),
      // Handle errors
      catchError((error) => {
        const errorMessage = 
          error && typeof error === 'object' && 'data' in error
            ? (error.data as { error?: string })?.error || "เกิดข้อผิดพลาดในการซื้อ"
            : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : "เกิดข้อผิดพลาดในการซื้อ";
        
        toast.error(errorMessage);
        return of(null);
      }),
      // Always reset loading state
      finalize(() => {
        setIsPurchasing(false);
      })
    );

    // Subscribe to the observable
    const subscription = purchaseObservable.subscribe();
    purchaseSubscriptionRef.current = subscription;
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (purchaseSubscriptionRef.current) {
        purchaseSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 border-t" aria-labelledby="episodes-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 id="episodes-heading" className="text-xl sm:text-2xl font-bold text-foreground">
          ตอนทั้งหมด {totalEpisodes} ตอน
        </h2>
      </div>

      {isLoggedIn && (
        <p className="text-sm sm:text-base text-muted-foreground">เลือกตอนที่ต้องการซื้อ</p>
      )}

      <div className="space-y-2">
        {isLoggedIn && selectedEpisodesForPurchase.length > 0 && (
          <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <span className="text-muted-foreground">
                เลือกแล้ว {selectedEpisodesForPurchase.length} ตอน
              </span>
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                <span>ราคารวม:</span>
                <span>{totalPrice.toLocaleString()}</span>
                <FontAwesomeIcon 
                  icon={faCoins} 
                  className="h-4 w-4 shrink-0" 
                />
              </div>
            </div>
            <Button 
              onClick={handleBuyClick}
              className="bg-green-600 hover:bg-green-700 text-white shrink-0"
            >
              <ShoppingCart className="size-4" />
              <span className="text-sm sm:text-base">ซื้อตอน</span>
            </Button>
          </div>
        )}
        {groupedEpisodes.map((group, groupIndex) => {
        const firstEp = group[0];
        const lastEp = group[group.length - 1];
        const allFree = group.every(ep => ep.price === 0);
        // Check if all episodes are owned or free (no need for checkbox)
        const allOwnedOrFree = group.every(ep => ep.price === 0 || ep.isOwned);
        // Get purchasable episodes (not owned, not free)
        const purchasableEpisodes = group.filter(ep => !ep.isOwned && ep.price > 0);
        // Check if all purchasable episodes in the group are checked
        const allPurchasableChecked = purchasableEpisodes.length > 0 && 
          purchasableEpisodes.every(ep => checkedEpisodes.has(ep.uuid));
        // Show smaller number first, then bigger number (since sorted DESC, lastEp is smaller)
        const minNumber = lastEp?.number || 0;
        const maxNumber = firstEp?.number || 0;
        const isOpen = openGroups.has(groupIndex);
        
        return (
          <Collapsible 
            key={groupIndex} 
            open={isOpen}
            onOpenChange={(open) => {
              setOpenGroups((prev) => {
                const newSet = new Set(prev);
                if (open) {
                  newSet.add(groupIndex);
                } else {
                  newSet.delete(groupIndex);
                }
                return newSet;
              });
            }}
          >
            <CollapsibleTrigger asChild>
              <Card className="bg-muted/50 p-3 sm:p-4 cursor-pointer hover:bg-muted transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {isLoggedIn && !allOwnedOrFree && (
                      <Checkbox 
                        className="shrink-0"
                        checked={allPurchasableChecked}
                        onCheckedChange={(checked) => {
                          // Update checked episodes state - only select episodes that are not owned and not free
                          updateCheckedEpisodes((prevEp) => {
                            const newEpSet = new Set(prevEp);
                            if (checked) {
                              group.forEach((ep) => {
                                // Only add episodes that can be purchased (not owned, not free)
                                if (!ep.isOwned && ep.price > 0) {
                                  newEpSet.add(ep.uuid);
                                }
                              });
                            } else {
                              group.forEach((ep) => {
                                newEpSet.delete(ep.uuid);
                              });
                            }
                            return newEpSet;
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <span className="font-medium text-sm sm:text-base text-foreground truncate">
                      ตอนที่ {minNumber} - {maxNumber}
                    </span>
                    {isLoggedIn && allOwnedOrFree && (
                      <Check className="size-4 sm:size-5 text-green-600 dark:text-green-400 shrink-0" />
                    )}
                  </div>
                  <ChevronDown className="size-4 sm:size-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </CollapsibleTrigger>
            {isOpen && (
              <CollapsibleContent>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                  {group.map((episode) => {
                  const isFree = episode.price === 0;
                  const isTemporaryOwned = episode.isOwned && episode.lockAfterDatetime !== null;
                  const isPermanentOwned = episode.isOwned && episode.lockAfterDatetime === null;
                  const showCheckbox = isLoggedIn && !isFree && !episode.isOwned;
                  const showCheckmark = isFree || isPermanentOwned;
                  const showClock = isTemporaryOwned;
                  const isChecked = checkedEpisodes.has(episode.uuid);
                  const canBeChecked = showCheckbox;

                  const handleCardClick = () => {
                    // If episode is owned (permanently or temporarily) or free, redirect to episode page
                    if ((episode.isOwned || isFree) && uuid) {
                      router.push(`/${type}/${uuid}/${episode.number}`);
                      return;
                    }
                    
                    // If episode can be checked (not owned, not free), toggle checkbox
                    if (canBeChecked) {
                      updateCheckedEpisodes((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(episode.uuid)) {
                          newSet.delete(episode.uuid);
                        } else {
                          newSet.add(episode.uuid);
                        }
                        return newSet;
                      });
                    }
                  };

                  return (
                    <Card
                      key={episode.uuid}
                      className={`p-2 sm:p-3 transition-colors ${
                        (canBeChecked || episode.isOwned || isFree) ? "cursor-pointer hover:bg-muted" : "cursor-default"
                      }`}
                      onClick={handleCardClick}
                    >
                      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          {showCheckbox && (
                            <Checkbox 
                              className="shrink-0" 
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                updateCheckedEpisodes((prev) => {
                                  const newSet = new Set(prev);
                                  if (checked) {
                                    newSet.add(episode.uuid);
                                  } else {
                                    newSet.delete(episode.uuid);
                                  }
                                  return newSet;
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <span className="text-xs sm:text-sm text-foreground truncate">ตอนที่ {episode.number}</span>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0">
                          {showCheckmark && (
                            <Check className="size-4 sm:size-5 text-green-600 dark:text-green-400 shrink-0" />
                          )}
                          {showClock && (
                            <Clock className="size-4 sm:size-5 text-blue-600 dark:text-blue-400 shrink-0" />
                          )}
                          {!episode.isOwned && !isFree && episode.price > 0 && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold">
                              <span className="text-orange-600 dark:text-orange-400">
                                {episode.price.toLocaleString()}
                              </span>
                              <FontAwesomeIcon 
                                icon={faCoins} 
                                className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 shrink-0" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
      </div>

      {/* Buy Confirmation Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>ยืนยันการซื้อ</DialogTitle>
            <DialogDescription>
              คุณต้องการซื้อตอนที่เลือกทั้งหมดหรือไม่?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 flex-1 min-h-0 overflow-hidden">
            {/* Selected Episodes List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {selectedEpisodesForPurchase.map((episode) => (
                  <div
                    key={episode.uuid}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        ตอนที่ {episode.number}
                        {episode.title && episode.title.trim() !== `ตอนที่ ${episode.number}` && (
                          <span className="text-muted-foreground ml-2">
                            {episode.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold shrink-0">
                      <span className="text-sm">{episode.price.toLocaleString()}</span>
                      <FontAwesomeIcon 
                        icon={faCoins} 
                        className="h-3 w-3 sm:h-4 sm:w-4" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* User Points and Price Summary - Compact */}
            <div className={`p-4 rounded-lg border ${
              hasEnoughPoints 
                ? "bg-primary/10 border-primary/20" 
                : "bg-destructive/10 border-destructive/20"
            }`}>
              <div className="space-y-2.5">
                {/* Current Points */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">แต้มปัจจุบัน</span>
                  <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <span className="text-sm font-medium">
                      {userPoints !== null ? userPoints.toLocaleString() : "..."}
                    </span>
                    <FontAwesomeIcon icon={faCoins} className="h-3 w-3" />
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ราคารวม</span>
                  <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <span className="text-sm font-medium">{totalPrice.toLocaleString()}</span>
                    <FontAwesomeIcon icon={faCoins} className="h-3 w-3" />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/50 my-1"></div>

                {/* Remaining Points */}
                <div className="flex items-center justify-between">
                  <span className={`text-base font-semibold ${
                    hasEnoughPoints ? "text-foreground" : "text-destructive"
                  }`}>
                    แต้มคงเหลือ
                  </span>
                  <div className={`flex items-center gap-1.5 font-bold ${
                    hasEnoughPoints 
                      ? "text-orange-600 dark:text-orange-400" 
                      : "text-destructive"
                  }`}>
                    <span className="text-lg">
                      {remainingPoints !== null 
                        ? remainingPoints.toLocaleString() 
                        : "..."}
                    </span>
                    <FontAwesomeIcon icon={faCoins} className="h-4 w-4" />
                  </div>
                </div>

                {/* Insufficient Points Warning */}
                {!hasEnoughPoints && userPoints !== null && (
                  <div className="pt-2 mt-2 border-t border-destructive/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-destructive">
                        ⚠️ แต้มของคุณไม่พอ กรุณาเติมเงินก่อน
                      </p>
                      <Button
                        size="sm"
                        asChild
                        className="h-7 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                      >
                        <Link href="/topup" onClick={() => setBuyDialogOpen(false)}>
                          เติมเงิน
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBuyDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={!hasEnoughPoints || userPoints === null || isPurchasing}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังซื้อ...
                </>
              ) : (
                "ยืนยันการซื้อ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

