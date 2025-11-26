"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  ArrowUp, 
  Maximize, 
  Minimize, 
  Settings, 
  Share2, 
  Sun,
  Play,
  Pause,
  Home,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShareDialog } from "@/components/common/ShareDialog";

export interface EpisodeFooterProps {
  totalPages?: number;
  currentPage?: number;
  onPageJump?: (page: number) => void;
  shareUrl?: string;
}

export function EpisodeFooter({
  totalPages,
  currentPage = 1,
  onPageJump,
  shareUrl,
}: EpisodeFooterProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50); // Speed in pixels per interval (1-100)
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [clientShareUrl, setClientShareUrl] = useState<string | undefined>(undefined);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify" | null>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  
  // Detect if this is a novel (no totalPages prop)
  const isNovel = totalPages === undefined;

  // Handle client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setClientShareUrl(typeof window !== "undefined" ? window.location.href : undefined);
  }, []);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Apply brightness
  useEffect(() => {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      (img as HTMLElement).style.filter = `brightness(${brightness}%)`;
    });
  }, [brightness]);

  // Apply text alignment for novels
  useEffect(() => {
    if (isNovel) {
      const novelContent = document.querySelector(".novel-content");
      if (novelContent) {
        if (textAlign) {
          (novelContent as HTMLElement).style.textAlign = textAlign;
        } else {
          (novelContent as HTMLElement).style.textAlign = "";
        }
      }
    }
  }, [textAlign, isNovel]);

  // Auto scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      // Set flag to true when auto-scrolling starts
      isProgrammaticScrollRef.current = true;
      
      // Use requestAnimationFrame for smooth scrolling
      let lastTime = 0;
      const interval = 16; // ~60fps
      
      const scroll = (currentTime: number) => {
        if (currentTime - lastTime >= interval) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          
          if (currentScroll < maxScroll) {
            // Calculate scroll amount based on speed (1-100 maps to 0.5-5 pixels per frame)
            const scrollAmount = (scrollSpeed / 100) * 5;
            window.scrollBy({
              top: scrollAmount,
              behavior: "auto" as ScrollBehavior,
            });
            lastTime = currentTime;
          } else {
            // Reached bottom, stop auto scroll
            isProgrammaticScrollRef.current = false;
            setIsAutoScrolling(false);
          }
        }
        
        if (isAutoScrolling) {
          autoScrollIntervalRef.current = requestAnimationFrame(scroll);
        }
      };
      
      autoScrollIntervalRef.current = requestAnimationFrame(scroll);
      
      return () => {
        if (autoScrollIntervalRef.current) {
          cancelAnimationFrame(autoScrollIntervalRef.current);
        }
        // Reset flag when auto-scrolling stops
        isProgrammaticScrollRef.current = false;
      };
    } else {
      if (autoScrollIntervalRef.current) {
        cancelAnimationFrame(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      // Reset flag when auto-scrolling is disabled
      isProgrammaticScrollRef.current = false;
    }
  }, [isAutoScrolling, scrollSpeed]);

  // Stop auto scroll when user manually scrolls
  useEffect(() => {
    const handleScroll = () => {
      // Only stop auto scroll if it's a manual scroll (not programmatic)
      if (isAutoScrolling && !isProgrammaticScrollRef.current) {
        setIsAutoScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAutoScrolling]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleShare = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  const handleReset = useCallback(() => {
    setBrightness(100);
    setScrollSpeed(50);
    if (isNovel) {
      setTextAlign(null);
    }
  }, [isNovel]);

  // Use client-side URL or fallback to prop
  const effectiveShareUrl = isMounted ? clientShareUrl : (shareUrl || undefined);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="flex items-center justify-between px-4 md:px-0 py-2 max-w-6xl mx-auto w-full">
        {/* Left side - Back to home */}
        <div className="flex items-center gap-4 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
                aria-label="Back to home"
              >
                <Link href="/">
                  <Home className="w-4 h-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>กลับหน้าหลัก</TooltipContent>
          </Tooltip>
        </div>

        {/* Center - Main tools */}
        <div className="flex items-center gap-2">
          {/* Scroll to top */}
          {showScrollTop && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>เลื่อนขึ้นด้านบน</TooltipContent>
            </Tooltip>
          )}

          {/* Auto scroll toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isAutoScrolling ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                aria-label="Toggle auto scroll"
              >
                {isAutoScrolling ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isAutoScrolling ? "หยุดเลื่อนอัตโนมัติ" : "เลื่อนอัตโนมัติ"}
            </TooltipContent>
          </Tooltip>

          {/* Fullscreen toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? "ออกจากโหมดเต็มจอ" : "โหมดเต็มจอ"}
            </TooltipContent>
          </Tooltip>

          {/* Reading settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Reading settings">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brightness" className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      ความสว่าง
                    </Label>
                    <span className="text-sm text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider
                    id="brightness"
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    min={50}
                    max={150}
                    step={5}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scroll-speed" className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      ความเร็วเลื่อนอัตโนมัติ
                    </Label>
                    <span className="text-sm text-muted-foreground">{scrollSpeed}%</span>
                  </div>
                  <Slider
                    id="scroll-speed"
                    value={[scrollSpeed]}
                    onValueChange={(value) => setScrollSpeed(value[0])}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Text alignment (Novel only) */}
                {isNovel && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">จัดตำแหน่งข้อความ</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={textAlign === "left" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextAlign("left")}
                          className="w-full"
                        >
                          <AlignLeft className="w-4 h-4 mr-2" />
                          ซ้าย
                        </Button>
                        <Button
                          variant={textAlign === "center" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextAlign("center")}
                          className="w-full"
                        >
                          <AlignCenter className="w-4 h-4 mr-2" />
                          กลาง
                        </Button>
                        <Button
                          variant={textAlign === "right" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextAlign("right")}
                          className="w-full"
                        >
                          <AlignRight className="w-4 h-4 mr-2" />
                          ขวา
                        </Button>
                        <Button
                          variant={textAlign === "justify" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextAlign("justify")}
                          className="w-full"
                        >
                          <AlignJustify className="w-4 h-4 mr-2" />
                          เต็มบรรทัด
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  รีเซ็ตการตั้งค่า
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Share */}
          {effectiveShareUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleShare}
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>แชร์</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Right side - Reserved for future features */}
        <div className="flex-1" />
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        url={effectiveShareUrl}
      />
    </div>
  );
}

