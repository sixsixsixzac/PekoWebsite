import { getEpisodeInfo, checkEpisodeOwnership, getEpisodeNavigation, purchaseEpisode } from "@/lib/api/cartoon";
import { getUserData } from "@/lib/api/user";
import { NovelRead } from "@/app/(frontend)/(cartoon)/novel/[uuid]/[episode]/NovelRead";
import { EpisodeUnlock } from "@/app/(frontend)/(cartoon)/components/EpisodeUnlock";
import { notFound, redirect } from "next/navigation";

export default async function NovelReadingPage({
  params,
}: {
  params: Promise<{ uuid: string; episode: string }>;
}) {
  const { uuid, episode } = await params;

  // Check episode ownership server-side
  const episodeInfo = await getEpisodeInfo("novel", uuid, episode);

  if (!episodeInfo) {
    notFound();
  }

  // Fetch user data and navigation in parallel for better performance
  const [userData, navigation] = await Promise.all([
    getUserData(),
    getEpisodeNavigation("novel", uuid, episodeInfo.epNo),
  ]);

  const { userId, buyImmediately, userPoints } = userData;

  // Check ownership after getting user data
  const isOwned = await checkEpisodeOwnership(
    episodeInfo.epId,
    episodeInfo.epPrice,
    userId
  );

  if (!isOwned) {
    // Auto-purchase if buyImmediately is enabled and user has enough points
    if (buyImmediately && userId && userPoints !== null && userPoints >= episodeInfo.epPrice && episodeInfo.epPrice > 0) {
      // Get episode UUID for purchase
      const { prisma } = await import("@/lib/prisma");
      const episodeRecord = await prisma.mangaEp.findFirst({
        where: {
          epId: episodeInfo.epId,
        },
        select: {
          uuid: true,
        },
      });

      if (episodeRecord) {
        const result = await purchaseEpisode([episodeRecord.uuid]);
        if (result.success) {
          // Redirect to refresh the page and show the purchased episode with auto-purchase notification
          redirect(`/novel/${uuid}/${episode}?autoPurchased=true&epPrice=${episodeInfo.epPrice}&epNo=${episodeInfo.epNo}`);
        } else {
          // If auto-purchase fails, redirect with error notification
          redirect(`/novel/${uuid}/${episode}?autoPurchaseFailed=true&error=${encodeURIComponent(result.error || "ไม่สามารถซื้อตอนได้")}`);
        }
      }
    }

    // Show unlock component if user doesn't own the episode
    return (
      <div className="max-w-6xl mx-auto">
        <EpisodeUnlock
          cartoonUuid={uuid}
          episode={episode}
          episodeInfo={{
            epId: episodeInfo.epId,
            epNo: episodeInfo.epNo,
            epName: episodeInfo.epName,
            epPrice: episodeInfo.epPrice,
          }}
          navigation={navigation}
          userPoints={userPoints}
          cartoonType="novel"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <NovelRead
        cartoonUuid={uuid}
        episode={episode}
        buyImmediately={buyImmediately}
        userPoints={userPoints}
      />
    </div>
  );
}

