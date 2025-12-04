import { notFound } from "next/navigation";
import { UserDetailStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateMetadata as generatePageMetadata } from "@/lib/utils/metadata";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { constructAuthorAvatarUrl, constructImageUrl } from "@/lib/utils/image-url";
import { type CartoonCardProps } from "@/components/common/CartoonCard";
import { decodeUsername } from "@/lib/utils/username-encode";
import { ProfileSection } from "../components/ProfileSection";
import { ProfileCartoonList } from "../components/ProfileCartoonList";

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
      uuid: true,
      displayName: true,
      userImg: true,
      point: true,
      sales: true,
      createdAt: true,
      detail: {
        select: {
          status: true,
        },
      },
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
        verified: user.detail?.status === UserDetailStatus.approve,
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

  // Get follower and following counts
  const followerCount = await prisma.userFollower.count({
    where: {
      followingId: user.id,
    },
  });

  const followingCount = await prisma.userFollower.count({
    where: {
      followerId: user.id,
    },
  });

  // Check if current user is following this profile user
  let isFollowing = false;
  const currentUser = await getCurrentUser();
  if (currentUser?.id && user.id) {
    const currentUserId = parseInt(currentUser.id);
    if (!isNaN(currentUserId) && currentUserId !== user.id) {
      const followRelationship = await prisma.userFollower.findFirst({
        where: {
          followerId: currentUserId,
          followingId: user.id,
        },
      });
      isFollowing = !!followRelationship;
    }
  }

  return {
    user,
    cartoons: cartoonCards,
    stats: {
      totalCartoons: cartoons.length,
      followers: followerCount,
      following: followingCount,
    },
    isFollowing,
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
  
  if (!profileData) notFound();

  const { user, cartoons, stats, isFollowing } = profileData;
  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser?.id;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10 lg:py-12">
        <ProfileSection
          user={user}
          stats={stats}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser || null}
          isFollowing={isFollowing}
        />

        {/* Cartoons Section */}
        <ProfileCartoonList
          cartoons={cartoons}
          totalCartoons={stats.totalCartoons}
        />
      </main>
    </div>
  );
}


