"use client";

import { useState, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { CartoonCard, type CartoonCardProps } from "@/components/common/CartoonCard";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ProfileCartoonListProps {
  cartoons: CartoonCardProps[];
  totalCartoons: number;
}

export function ProfileCartoonList({
  cartoons,
  totalCartoons,
}: ProfileCartoonListProps) {
  const [activeTab, setActiveTab] = useState<"all" | "manga" | "novel">("all");

  // Calculate counts and filtered lists for each type
  const { mangaCount, novelCount, allCartoons, mangaCartoons, novelCartoons } = useMemo(() => {
    const manga = cartoons.filter((c) => c.type === "manga");
    const novel = cartoons.filter((c) => c.type === "novel");
    return {
      mangaCount: manga.length,
      novelCount: novel.length,
      allCartoons: cartoons,
      mangaCartoons: manga,
      novelCartoons: novel,
    };
  }, [cartoons]);

  if (cartoons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-12 text-center">
        <BookOpen className="size-12 text-muted-foreground" />
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-card-foreground">
            ยังไม่มีผลงาน
          </h3>
          <p className="text-sm text-muted-foreground">
            ผู้ใช้รายนี้ยังไม่ได้เผยแพร่ผลงานใดๆ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "manga" | "novel")} className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-card-foreground">
            ผลงานทั้งหมด ({totalCartoons})
          </h2>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">
              ทั้งหมด ({totalCartoons})
            </TabsTrigger>
            <TabsTrigger value="manga" className="flex-1 sm:flex-initial">
              มังงะ ({mangaCount})
            </TabsTrigger>
            <TabsTrigger value="novel" className="flex-1 sm:flex-initial">
              นิยาย ({novelCount})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          {allCartoons.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-12 text-center">
              <BookOpen className="size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ไม่มีผลงานในหมวดหมู่นี้
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                "auto-rows-fr"
              )}
            >
              {allCartoons.map((cartoon) => (
                <CartoonCard key={cartoon.uuid} {...cartoon} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manga" className="mt-4">
          {mangaCartoons.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-12 text-center">
              <BookOpen className="size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ยังไม่มีมังงะ
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                "auto-rows-fr"
              )}
            >
              {mangaCartoons.map((cartoon) => (
                <CartoonCard key={cartoon.uuid} {...cartoon} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="novel" className="mt-4">
          {novelCartoons.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-card p-12 text-center">
              <BookOpen className="size-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ยังไม่มีนิยาย
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                "auto-rows-fr"
              )}
            >
              {novelCartoons.map((cartoon) => (
                <CartoonCard key={cartoon.uuid} {...cartoon} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

