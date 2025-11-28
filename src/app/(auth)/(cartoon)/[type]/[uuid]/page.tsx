import { CartoonDetailPage } from "@/app/(auth)/(cartoon)/components/CartoonDetailPage";
import { CartoonEpisodeList } from "@/app/(auth)/(cartoon)/components/CartoonEpisodeList";
import { FollowUserButtonClient } from "@/components/common/FollowUserButtonClient";
import { generateMetadata as genMeta } from "@/lib/utils/metadata";
import { getCartoonByUuid } from "@/lib/api/frontend.cartoon";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; uuid: string }>;
}) {
  const { type, uuid } = await params;

  // Validate type
  if (type !== "manga" && type !== "novel") {
    return genMeta({
      title: "ไม่พบหน้า",
      description: "ไม่พบหน้าที่คุณต้องการ",
      keywords: [],
    });
  }

  try {
    const cartoon = await getCartoonByUuid(uuid, type);
    const keywords = type === "manga" 
      ? ["มังงะ", "manga", cartoon.title, ...cartoon.genres]
      : ["นิยาย", "novel", cartoon.title, ...cartoon.genres];
    
    return genMeta({
      title: cartoon.title,
      description: cartoon.description,
      keywords,
    });
  } catch {
    const defaultTitle = type === "manga" ? "มังงะ" : "นิยาย";
    const defaultKeywords = type === "manga" ? ["มังงะ", "manga"] : ["นิยาย", "novel"];
    
    return genMeta({
      title: defaultTitle,
      description: `รายละเอียด${defaultTitle}`,
      keywords: defaultKeywords,
    });
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; uuid: string }>;
}) {
  const { type, uuid } = await params;

  // Validate type
  if (type !== "manga" && type !== "novel") {
    notFound();
  }

  const cartoon = await getCartoonByUuid(uuid, type);
  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser?.id;

  return (
    <>
      <CartoonDetailPage
        type={type}
        title={cartoon.title}
        coverImage={cartoon.coverImage}
        author={cartoon.author}
        stats={cartoon.stats}
        description={cartoon.description}
        uuid={cartoon.uuid}
        followButton={
          isLoggedIn ? (
            <FollowUserButtonClient
              targetUserUuid={cartoon.author.uuid}
              initialIsFollowing={cartoon.isFollowingAuthor || false}
              className="shrink-0"
            />
          ) : undefined
        }
      />

      <CartoonEpisodeList 
        episodes={cartoon.episodes} 
        type={type} 
        uuid={cartoon.uuid}
        totalEpisodes={cartoon.stats.episodes}
      />
    </>
  );
}

