"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Shared EpisodeInfo type for both manga and novel episodes
 */
export interface EpisodeInfo {
  epId: number;
  pId: number;
  epNo: number;
  epName: string;
  epPrice: number;
  title?: string; // Cartoon title
  totalImage?: number; // For manga: number of images
  totalParagraphs?: number; // For novel: approximate paragraph count (optional)
  prevEpNo?: number | null; // Previous episode number
  nextEpNo?: number | null; // Next episode number
  updatedAt?: Date; // Episode update timestamp
}

/**
 * Get cartoon type from URL path
 */
export async function getCartoonTypeFromUrl(pathname: string): Promise<"manga" | "novel" | null> {
  if (pathname.startsWith("/manga/")) {
    return "manga";
  }
  if (pathname.startsWith("/novel/")) {
    return "novel";
  }
  return null;
}

/**
 * Unified function to get episode info for both manga and novel
 * @param type - "manga" or "novel"
 * @param cartoonUuid - Cartoon UUID
 * @param episodeNumber - Episode number (string or number)
 * @param options - Optional configuration
 * @returns EpisodeInfo or null if not found
 */
export async function getEpisodeInfo(
  type: "manga" | "novel",
  cartoonUuid: string,
  episodeNumber: string | number,
  options?: {
    includeTitle?: boolean;
    includeNavigation?: boolean;
  }
): Promise<EpisodeInfo | null> {
  const episodeNo = typeof episodeNumber === "string" ? parseInt(episodeNumber) : episodeNumber;
  if (isNaN(episodeNo)) {
    return null;
  }

  try {
    // Fetch episode
    const episode = await prisma.mangaEp.findFirst({
      where: {
        cartoon: {
          uuid: cartoonUuid,
          type,
          status: "active",
        },
        epNo: episodeNo,
        status: "active",
      },
      select: {
        epId: true,
        pId: true,
        epNo: true,
        epName: true,
        epPrice: true,
        totalImage: true,
        updatedAt: true,
      },
    });

    if (!episode) {
      return null;
    }

    // Build base episode info
    const episodeInfo: EpisodeInfo = {
      epId: episode.epId,
      pId: episode.pId,
      epNo: episode.epNo,
      epName: episode.epName,
      epPrice: episode.epPrice,
      updatedAt: episode.updatedAt,
    };

    // Add type-specific fields
    if (type === "manga" && episode.totalImage !== null) {
      episodeInfo.totalImage = episode.totalImage;
    } else if (type === "novel") {
      // For novels, we could calculate paragraph count from content if needed
      // For now, we'll leave it optional
    }

    // Add cartoon title if requested
    if (options?.includeTitle) {
      const cartoon = await prisma.cartoon.findFirst({
        where: {
          uuid: cartoonUuid,
          type,
          status: "active",
        },
        select: {
          title: true,
        },
      });
      if (cartoon) {
        episodeInfo.title = cartoon.title;
      }
    }

    // Add navigation if requested
    if (options?.includeNavigation) {
      const navigation = await getEpisodeNavigation(type, cartoonUuid, episodeNo);
      episodeInfo.prevEpNo = navigation.prevEpNo;
      episodeInfo.nextEpNo = navigation.nextEpNo;
    }

    return episodeInfo;
  } catch (error) {
    console.error(`Error fetching ${type} episode info:`, error);
    return null;
  }
}

/**
 * Unified function to check episode ownership
 * @param epId - Episode ID
 * @param epPrice - Episode price
 * @param userId - Optional user ID
 * @returns true if user owns the episode
 */
export async function checkEpisodeOwnership(
  epId: number,
  epPrice: number,
  userId?: number
): Promise<boolean> {
  // Free episodes are always accessible
  if (epPrice === 0) {
    return true;
  }

  // If no user, can't own paid episode
  if (!userId) {
    return false;
  }

  try {
    // Check ownership in SQL:
    // Episode is owned if purchase exists AND:
    // 1. lockAfterDatetime is null (permanent ownership), OR
    // 2. lockAfterDatetime > NOW() (temporary ownership still valid)
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM ep_shop
      WHERE user_id = ${userId}
        AND ep_id = ${epId}
        AND (lock_after_datetime IS NULL OR lock_after_datetime > NOW())
    `;

    const count = result[0]?.count ?? BigInt(0);
    return Number(count) > 0;
  } catch (error) {
    console.error("Error checking episode ownership:", error);
    return false;
  }
}

/**
 * Unified function to get episode navigation (prev/next)
 * @param type - "manga" or "novel"
 * @param cartoonUuid - Cartoon UUID
 * @param currentEpNo - Current episode number
 * @returns Navigation info with prevEpNo and nextEpNo
 */
export async function getEpisodeNavigation(
  type: "manga" | "novel",
  cartoonUuid: string,
  currentEpNo: number
): Promise<{ prevEpNo: number | null; nextEpNo: number | null }> {
  try {
    // Get the cartoon's pId first
    const cartoon = await prisma.cartoon.findFirst({
      where: {
        uuid: cartoonUuid,
        type,
        status: "active",
      },
      select: {
        pId: true,
      },
    });

    if (!cartoon) {
      return { prevEpNo: null, nextEpNo: null };
    }

    // Get all episode numbers for this cartoon, ordered by epNo
    const episodes = await prisma.mangaEp.findMany({
      where: {
        pId: cartoon.pId,
        status: "active",
      },
      select: {
        epNo: true,
      },
      orderBy: {
        epNo: "asc",
      },
    });

    const episodeNumbers = episodes.map((ep) => ep.epNo);
    const currentIndex = episodeNumbers.indexOf(currentEpNo);

    const prevEpNo = currentIndex > 0 ? episodeNumbers[currentIndex - 1] : null;
    const nextEpNo = currentIndex < episodeNumbers.length - 1 ? episodeNumbers[currentIndex + 1] : null;

    return { prevEpNo, nextEpNo };
  } catch (error) {
    console.error(`Error fetching ${type} episode navigation:`, error);
    return { prevEpNo: null, nextEpNo: null };
  }
}

/**
 * Get manga episode images with pagination
 */
export async function getMangaEpisodeImages(
  pId: number,
  epNo: number,
  page: number = 1,
  limit: number = 10
): Promise<{ images: string[]; hasMore: boolean; total: number }> {
  const skip = (page - 1) * limit;

  const images = await prisma.mangaEpImage.findMany({
    where: {
      pId,
      epNo,
    },
    select: {
      epiImageName: true,
    },
    orderBy: {
      epiId: "asc",
    },
    skip,
    take: limit + 1, // Fetch one extra to check if there's more
  });

  const hasMore = images.length > limit;
  const imageList = hasMore ? images.slice(0, limit) : images;

  // Construct image URLs
  // Based on the folder structure: /images/manga_episode_images/{pId}/{epNo}/{imageName}
  const imageUrls = imageList.map((img) => 
    `/images/manga_episode_images/${pId}/${epNo}/${img.epiImageName}`
  );

  // Get total count
  const total = await prisma.mangaEpImage.count({
    where: {
      pId,
      epNo,
    },
  });

  return {
    images: imageUrls,
    hasMore,
    total,
  };
}

/**
 * Unified function to purchase episodes (manga or novel)
 * @param episodeUuids - Array of episode UUIDs to purchase
 * @returns Success or error result
 */
export async function purchaseEpisode(
  episodeUuids: string[]
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Get userId from server-side session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return { success: false, error: "ไม่ได้รับอนุญาต" };
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return { success: false, error: "ไม่พบผู้ใช้กรุณาเข้าสู่ระบบ" };
    }

    // Validate episode UUIDs array
    if (!Array.isArray(episodeUuids) || episodeUuids.length === 0) {
      return { success: false, error: "ไม่ได้ระบุตอน" };
    }

    // Fetch all episodes by UUIDs first
    const episodes = await prisma.mangaEp.findMany({
      where: {
        uuid: { in: episodeUuids },
        status: "active",
      },
      select: {
        epId: true,
        pId: true,
        epNo: true,
        epPrice: true,
        lockDurationDays: true,
      },
    });

    // Validate all episodes were found
    if (episodes.length !== episodeUuids.length) {
      return { success: false, error: "ไม่พบตอนที่ระบุ" };
    }

    // Filter out free episodes
    const paidEpisodes = episodes.filter((ep) => ep.epPrice > 0);
    if (paidEpisodes.length === 0) {
      return { success: false, error: "ตอนที่เลือกทั้งหมดฟรี" };
    }

    // Calculate total price from all episodes
    const totalPrice = paidEpisodes.reduce((sum, ep) => sum + ep.epPrice, 0);

    // Get user points from database
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { point: true },
    });

    if (!userProfile) {
      return { success: false, error: "ไม่พบผู้ใช้" };
    }

    const userPoints = userProfile.point;

    // Check if user has enough points BEFORE any other operations
    if (userPoints < totalPrice) {
      return { success: false, error: "พอยต์ไม่เพียงพอ" };
    }

    // Check for already owned episodes
    const epIds = paidEpisodes.map((ep) => ep.epId);
    const existingPurchases = await prisma.epShop.findMany({
      where: {
        userId: userId,
        epId: { in: epIds },
        OR: [
          { lockAfterDatetime: null },
          { lockAfterDatetime: { gt: new Date() } },
        ],
      },
      select: {
        epId: true,
      },
      distinct: ["epId"],
    });

    const ownedEpIds = new Set(existingPurchases.map((p) => p.epId));
    const alreadyOwned = paidEpisodes.filter((ep) => ownedEpIds.has(ep.epId));

    if (alreadyOwned.length > 0) {
      return { success: false, error: "ตอนที่เลือกบางตอนเป็นเจ้าของแล้ว" };
    }

    // Start transaction to purchase all episodes
    await prisma.$transaction(async (tx) => {
      // Calculate remaining points for each episode upfront
      let remainingPoints = userPoints;
      const purchaseData = paidEpisodes.map((episode) => {
        remainingPoints -= episode.epPrice;
        return {
          userId: Number(userId),
          epId: Number(episode.epId),
          epNo: Number(episode.epNo),
          point: Number(episode.epPrice),
          remainPoint: Number(remainingPoints),
          lockDurationDays: episode.lockDurationDays ? Number(episode.lockDurationDays) : null,
        };
      });

      // Build batch INSERT query with all purchase records at once
      // Using SQL to handle lock_after_datetime calculation efficiently
      // All values are validated numbers from database queries, so safe for batch insert
      const values = purchaseData
        .map(
          (data) =>
            `(${data.userId}, ${data.epId}, ${data.epNo}, ${data.point}, ${data.remainPoint}, ${
              data.lockDurationDays !== null
                ? `DATE_ADD(NOW(), INTERVAL ${data.lockDurationDays} DAY)`
                : "NULL"
            })`
        )
        .join(", ");

      await tx.$executeRawUnsafe(`
        INSERT INTO ep_shop (
          user_id, ep_id, ep_no, point, remain_point, lock_after_datetime
        ) VALUES ${values}
      `);

      // Deduct total points from user AFTER all records are created
      // This ensures the transaction is atomic
      await tx.$executeRaw`
        UPDATE user_profile 
        SET point = point - ${totalPrice}
        WHERE id = ${userId}
      `;
    });

    return { success: true };
  } catch (error) {
    console.error("Error purchasing episodes:", error);
    return { success: false, error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" };
  }
}


/**
 * Get novel episode content
 */
export async function getNovelEpisodeContent(
  pId: number,
  epNo: number
): Promise<{ content: string | null }> {
  const episode = await prisma.mangaEp.findFirst({
    where: {
      pId,
      epNo,
      status: "active",
    },
    select: {
      epContent: true,
    },
  });

  return {
    content: episode?.epContent || null,
  };
}

