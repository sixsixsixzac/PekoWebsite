"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { EpisodeHeaderProps } from "./types";

export function EpisodeHeader({
  episodeInfo,
  navigation,
  onNavigate,
  isLoading = false,
  position = "sticky",
}: EpisodeHeaderProps) {
  const positionClass = position === "fixed" ? "fixed" : "sticky";
  const widthClass = position === "fixed" ? "w-full" : "";
  
  return (
    <div className={`${positionClass} ${widthClass} top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b`}>
      <div className="flex items-center justify-between px-4 md:px-0 py-2">
        <div className="flex-1 px-3">
          {episodeInfo ? (
            <div>
              <h2 className="text-base font-semibold">ตอนที่ {episodeInfo.epNo}</h2>
              <p className="text-xs text-muted-foreground">{episodeInfo.epName}</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate(navigation?.prevEpNo ?? null)}
            disabled={!navigation?.prevEpNo}
            className={`p-1.5 rounded-md transition-colors ${
              navigation?.prevEpNo
                ? "hover:bg-accent cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Previous episode"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate(navigation?.nextEpNo ?? null)}
            disabled={!navigation?.nextEpNo}
            className={`p-1.5 rounded-md transition-colors ${
              navigation?.nextEpNo
                ? "hover:bg-accent cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Next episode"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

