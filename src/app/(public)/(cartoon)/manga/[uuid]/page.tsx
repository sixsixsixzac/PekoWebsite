import { CartoonDetailPage } from "@/app/(public)/(cartoon)/components/CartoonDetailPage";
import { generateMetadata as genMeta } from "@/lib/utils/metadata";
import { getCartoonByUuid } from "@/lib/api/frontend.cartoon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  
  try {
    const cartoon = await getCartoonByUuid(uuid, "manga");
    return genMeta({
      title: cartoon.title,
      description: cartoon.description,
      keywords: ["มังงะ", "manga", cartoon.title, ...cartoon.genres],
    });
  } catch {
    return genMeta({
      title: "มังงะ",
      description: "รายละเอียดมังงะ",
      keywords: ["มังงะ", "manga"],
    });
  }
}

export default async function MangaPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const cartoon = await getCartoonByUuid(uuid, "manga");

  return (
    <CartoonDetailPage
      type="manga"
      title={cartoon.title}
      coverImage={cartoon.coverImage}
      author={cartoon.author}
      stats={cartoon.stats}
      description={cartoon.description}
      episodes={cartoon.episodes}
      uuid={cartoon.uuid}
    />
  );
}

