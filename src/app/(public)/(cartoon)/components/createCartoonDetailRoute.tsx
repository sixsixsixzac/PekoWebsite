import { CartoonDetailPage } from "@/app/(public)/(cartoon)/components/CartoonDetailPage";
import { generateMetadata as genMeta } from "@/lib/utils/metadata";
import { getCartoonByUuid } from "@/lib/api/frontend.cartoon";

type CartoonType = "manga" | "novel";

interface DetailRouteConfig {
  type: CartoonType;
  defaultTitle: string;
  defaultDescription: string;
  baseKeywords: string[];
}

export function createCartoonDetailRouteHandlers(config: DetailRouteConfig) {
  async function generateMetadata({
    params,
  }: {
    params: Promise<{ uuid: string }>;
  }) {
    const { uuid } = await params;

    try {
      const cartoon = await getCartoonByUuid(uuid, config.type);
      return genMeta({
        title: cartoon.title,
        description: cartoon.description,
        keywords: [...config.baseKeywords, cartoon.title, ...cartoon.genres],
      });
    } catch {
      return genMeta({
        title: config.defaultTitle,
        description: config.defaultDescription,
        keywords: config.baseKeywords,
      });
    }
  }

  async function Page({
    params,
  }: {
    params: Promise<{ uuid: string }>;
  }) {
    const { uuid } = await params;
    const cartoon = await getCartoonByUuid(uuid, config.type);

    return (
      <CartoonDetailPage
        type={config.type}
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

  return { generateMetadata, Page };
}


