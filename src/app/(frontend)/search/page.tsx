import { SearchPageClient } from "./components/SearchPageClient";
import { getAllCategories } from "@/lib/api/category";
import type { SearchFilters } from "@/lib/types/search";
import {
  TYPE_MANGA,
  TYPE_NOVEL,
  ORIGIN_TYPE_THAI,
  ORIGIN_TYPE_JAPANESE,
  ORIGIN_TYPE_KOREAN,
  ORIGIN_TYPE_CHINESE,
} from "@/lib/constants/cartoon.constants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const categories = await getAllCategories();

  // Await searchParams if it's a Promise (Next.js 15+)
  const params = searchParams instanceof Promise ? await searchParams : searchParams;

  // Parse URL parameters into SearchFilters
  const initialFilters: SearchFilters = {
    name: typeof params.name === "string" ? params.name : "",
    cartoonType:
      typeof params.cartoonType === "string" &&
      (params.cartoonType === TYPE_MANGA || params.cartoonType === TYPE_NOVEL)
        ? params.cartoonType
        : "all",
    orderBy:
      typeof params.orderBy === "string" &&
      ["views", "likes", "latest", "chapters", "latest_update"].includes(
        params.orderBy
      )
        ? (params.orderBy as "views" | "likes" | "latest" | "chapters" | "latest_update")
        : "views",
    mainCategory:
      typeof params.mainCategory === "string"
        ? params.mainCategory
        : Array.isArray(params.mainCategory)
        ? params.mainCategory
        : "all",
    subCategory:
      typeof params.subCategory === "string"
        ? params.subCategory
        : Array.isArray(params.subCategory)
        ? params.subCategory
        : "all",
    age:
      typeof params.age === "string" &&
      ["all", "teen", "mature"].includes(params.age)
        ? (params.age as "all" | "teen" | "mature")
        : "all",
    complete_status:
      typeof params.complete_status === "string" &&
      ["all", "completed", "ongoing"].includes(params.complete_status)
        ? (params.complete_status as "all" | "completed" | "ongoing")
        : "all",
    original:
      typeof params.original === "string" &&
      [
        "all",
        ORIGIN_TYPE_THAI.toString(),
        ORIGIN_TYPE_JAPANESE.toString(),
        ORIGIN_TYPE_KOREAN.toString(),
        ORIGIN_TYPE_CHINESE.toString(),
      ].includes(params.original)
        ? (params.original as "all" | "1" | "2" | "3" | "4")
        : "all",
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <SearchPageClient
              mainCategories={categories}
              subCategories={categories}
              initialFilters={initialFilters}
            />
          </div>
        </ScrollArea>
      </div>
  );
}

