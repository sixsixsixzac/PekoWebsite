import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateMetadata as generatePageMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Eye, Heart, Trophy } from "lucide-react";
import Link from "next/link";
import { FollowButton } from "@/components/common/FollowButton";
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
        verified: false,
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

  // Mock super fans data
  const superFans = [
    { id: 1, name: "chat0077", username: "chat0077", avatar: null },
    { id: 2, name: "Aphicha...", username: "aphicha", avatar: null },
    { id: 3, name: "Kittitas ...", username: "kittitas", avatar: null },
    { id: 4, name: "Stiecker", username: "stiecker", avatar: null },
    { id: 5, name: "teerasu...", username: "teerasu", avatar: null },
    { id: 6, name: "rattapo...", username: "rattapo", avatar: null },
    { id: 7, name: "CHaa ZZ...", username: "chaazz", avatar: null },
    { id: 8, name: "Dakon", username: "dakon", avatar: null },
    { id: 9, name: "ณัฐสิทธิ์ เ...", username: "nattasit", avatar: null },
    { id: 10, name: "Sukuna", username: "sukuna", avatar: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
        {/* Profile Header */}
        <div className="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:gap-8">
          <Avatar className="mx-auto size-24 shrink-0 border-4 border-background shadow-lg sm:mx-0">
            <AvatarImage
              src={constructAuthorAvatarUrl(user.userImg)}
              alt={`${user.displayName} avatar`}
            />
            <AvatarFallback className="text-2xl">
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold text-card-foreground sm:text-3xl">
                {user.displayName}
              </h1>
            </div>

            {/* Stats */}
            <div className="flex justify-between gap-4 sm:justify-start sm:gap-6">
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

            {/* Follow Button - Mobile: Full Width Under Stats */}
            <div className="w-full md:hidden">
              <FollowButton className="w-full" />
            </div>
          </div>

          {/* Follow Button - Desktop: Right Side */}
          <div className="hidden md:flex shrink-0">
            <FollowButton />
          </div>
        </div>

        {/* Super Fans Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="size-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-lg font-semibold text-card-foreground">แฟนตัวยง (Top Fan)</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {superFans.map((fan, index) => {
              const rank = index + 1;
              const getMedalStyle = () => {
                if (rank === 1) return "text-yellow-500 fill-yellow-500";
                if (rank === 2) return "text-gray-300 fill-gray-300";
                if (rank === 3) return "text-amber-700 fill-amber-700";
                return "";
              };

              return (
                <Link
                  key={fan.id}
                  href={`/profile/${encodeURIComponent(fan.username)}`}
                  className="flex flex-col items-center gap-2 shrink-0 min-w-[80px]"
                >
                  <div className="relative">
                    <Avatar className="size-14 border-2 border-background">
                      <AvatarImage
                        src={fan.avatar ? constructAuthorAvatarUrl(fan.avatar) : undefined}
                        alt={fan.name}
                      />
                      <AvatarFallback className="text-sm">
                        {fan.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {rank <= 3 && (
                      <div className="absolute -top-1 -right-1 z-10">
                        <div className={cn("relative flex items-center justify-center", getMedalStyle())}>
                          <Trophy className="size-6 drop-shadow-md" />
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-sm">
                            {rank}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-center text-xs font-medium text-card-foreground line-clamp-1 max-w-[80px]">
                    {fan.name}
                  </span>
                </Link>
              );
            })}
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

