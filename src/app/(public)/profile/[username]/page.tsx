import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateMetadata as generatePageMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen, Eye, Heart } from "lucide-react";
import { constructAuthorAvatarUrl, constructImageUrl } from "@/lib/utils/image-url";
import { CartoonCard, type CartoonCardProps } from "@/components/common/CartoonCard";
import { cn } from "@/lib/utils";
import { decodeUsername } from "@/lib/utils/username-encode";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUserProfile(username: string) {
  // Decode the obfuscated username from URL
  const decodedUsername = decodeUsername(decodeURIComponent(username));
  
  const user = await prisma.userProfile.findFirst({
    where: {
      uName: decodedUsername,
      uStatus: 1, // Active users only
    },
    select: {
      id: true,
      displayName: true,
      userImg: true,
      level: true,
      point: true,
      sales: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Fetch user's cartoons
  const cartoons = await prisma.cartoon.findMany({
    where: {
      authorId: user.id,
      status: "active",
      publishStatus: 1,
    },
    select: {
      uuid: true,
      title: true,
      coverImage: true,
      type: true,
      completionStatus: true,
      createdAt: true,
      categoryMain: true,
      categorySub: true,
      ageRate: true,
      author: {
        select: {
          displayName: true,
          uName: true,
          userImg: true,
          level: true,
        },
      },
      _count: {
        select: {
          episodeViews: true,
          favorites: true,
          episodes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Collect category IDs
  const categoryIds = new Set<number>();
  cartoons.forEach((cartoon) => {
    if (cartoon.categoryMain) categoryIds.add(cartoon.categoryMain);
    if (cartoon.categorySub) categoryIds.add(cartoon.categorySub);
  });

  // Fetch categories
  const categoryMap = new Map<number, string>();
  if (categoryIds.size > 0) {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: Array.from(categoryIds) },
        status: 1,
      },
      select: {
        id: true,
        categoryName: true,
      },
    });
    categories.forEach((cat) => categoryMap.set(cat.id, cat.categoryName));
  }

  // Calculate date threshold for "new" badge
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Transform cartoons to CartoonCardProps format
  const cartoonCards: CartoonCardProps[] = cartoons.map((cartoon) => {
    const genres: string[] = [];
    const mainCat = cartoon.categoryMain ? categoryMap.get(cartoon.categoryMain) : null;
    const subCat = cartoon.categorySub ? categoryMap.get(cartoon.categorySub) : null;
    if (mainCat) genres.push(mainCat);
    if (subCat) genres.push(subCat);

    return {
      uuid: cartoon.uuid?.toString() || "",
      title: cartoon.title,
      coverImage: constructImageUrl(cartoon.coverImage, "/images/post_img/default.png"),
      author: {
        name: cartoon.author.displayName,
        username: cartoon.author.uName || "",
        avatar: constructAuthorAvatarUrl(cartoon.author.userImg),
        verified: cartoon.author.level >= 2,
      },
      genres,
      views: cartoon._count.episodeViews,
      chapters: cartoon._count.episodes,
      likes: cartoon._count.favorites,
      isNew: cartoon.createdAt ? cartoon.createdAt > sevenDaysAgo : false,
      type: cartoon.type,
      complete_status: cartoon.completionStatus === 1 ? "completed" : "ongoing",
      ageRate: cartoon.ageRate || undefined,
    };
  });

  // Get total stats
  const totalViews = cartoons.reduce((sum, c) => sum + c._count.episodeViews, 0);
  const totalLikes = cartoons.reduce((sum, c) => sum + c._count.favorites, 0);
  const totalEpisodes = cartoons.reduce((sum, c) => sum + c._count.episodes, 0);

  return {
    user,
    cartoons: cartoonCards,
    stats: {
      totalCartoons: cartoons.length,
      totalViews,
      totalLikes,
      totalEpisodes,
    },
  };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeUsername(decodeURIComponent(username));

  return generatePageMetadata({
    title: `โปรไฟล์ ${decodedUsername}`,
    description: `ดูโปรไฟล์และผลงานของ ${decodedUsername}`,
    keywords: [decodedUsername, "โปรไฟล์", "profile", "ผู้เขียน"],
  });
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profileData = await getUserProfile(username);
  console.log(profileData);
  if (!profileData) {
    notFound();
  }

  const { user, cartoons, stats } = profileData;
  const isVerified = user.level >= 2;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
        {/* Profile Header */}
        <div className="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:gap-8">
          <Avatar className="size-24 shrink-0 border-4 border-background shadow-lg">
            <AvatarImage
              src={constructAuthorAvatarUrl(user.userImg)}
              alt={`${user.displayName} avatar`}
            />
            <AvatarFallback className="text-2xl">
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-card-foreground sm:text-3xl">
                {user.displayName}
              </h1>
              {isVerified && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="size-3.5 text-blue-500" />
                  <span>ยืนยันตัวตนแล้ว</span>
                </Badge>
              )}
              {user.level >= 6 && (
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="size-3.5" />
                  <span>ผู้เขียน</span>
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{stats.totalCartoons}</span>
                  <span className="text-xs text-muted-foreground">เรื่อง</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {stats.totalViews >= 1000
                      ? `${(stats.totalViews / 1000).toFixed(1)}K`
                      : stats.totalViews}
                  </span>
                  <span className="text-xs text-muted-foreground">ยอดดู</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {stats.totalLikes >= 1000
                      ? `${(stats.totalLikes / 1000).toFixed(1)}K`
                      : stats.totalLikes}
                  </span>
                  <span className="text-xs text-muted-foreground">ไลค์</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartoons Section */}
        {cartoons.length > 0 ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-card-foreground">
              ผลงานทั้งหมด ({stats.totalCartoons})
            </h2>
            <div
              className={cn(
                "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                "auto-rows-fr"
              )}
            >
              {cartoons.map((cartoon) => (
                <CartoonCard key={cartoon.uuid} {...cartoon} />
              ))}
            </div>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}

