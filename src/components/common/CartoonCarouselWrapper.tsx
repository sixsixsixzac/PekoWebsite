import type { SearchFilters } from "@/lib/types/search";
import { searchCartoons } from "@/lib/api/search";
import { CartoonCarousel } from "@/components/common/CartoonCarousel";

interface CartoonCarouselWrapperProps {
    title?: string;
    /** Optional filters for which cartoons to load */
    filters?: SearchFilters;
    /** Number of items to fetch on first load (SSR) */
    limit?: number;
    /** Optional className for the outer wrapper */
    className?: string;
    /** Mark the first item in this carousel as high-priority for image loading (better LCP) */
    priorityFirst?: boolean;
}

/**
 * Server component wrapper for CartoonCarousel.
 * - Fetches initial cartoons on the server for SSR.
 * - Hydrates into a client component that can fetch more cartoons via CSR.
 */
export async function CartoonCarouselWrapper({
    title,
    filters,
    // Fetch enough items so desktop/tablet always has scrollable overflow
    limit = 12,
    className,
    priorityFirst = false,
}: CartoonCarouselWrapperProps) {
    const initial = await searchCartoons({
        page: 1,
        limit,
        ...(filters ?? {}),
    });

    if (!initial.data.length) {
        return null;
    }

    const params = new URLSearchParams();

    if (filters) {
        const {
            name,
            cartoonType,
            complete_status,
            orderBy,
            mainCategory,
            subCategory,
            age,
            original,
        } = filters;

        if (name) params.set("name", name);
        if (cartoonType && cartoonType !== "all") params.set("cartoonType", cartoonType);
        if (complete_status && complete_status !== "all") params.set("complete_status", complete_status);
        if (orderBy && orderBy !== "relevance") params.set("orderBy", orderBy);
        if (age && age !== "all") params.set("age", age);
        if (original && original !== "all") params.set("original", original);

        if (mainCategory && mainCategory !== "all") {
            if (Array.isArray(mainCategory)) {
                mainCategory.forEach((id) => params.append("mainCategory", id));
            } else {
                params.set("mainCategory", mainCategory);
            }
        }

        if (subCategory && subCategory !== "all") {
            if (Array.isArray(subCategory)) {
                subCategory.forEach((id) => params.append("subCategory", id));
            } else {
                params.set("subCategory", subCategory);
            }
        }
    }

    const searchHref = params.toString() ? `/search?${params.toString()}` : "/search";

    const items = priorityFirst
        ? initial.data.map((item, index) =>
            index === 0 ? { ...item, priority: true } : item
        )
        : initial.data;

    // Lightweight, SEO-friendly JSON-LD for this carousel (one script per carousel instead of per-card)
    const schemaOrg = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        itemListElement: items.map((item, index) => ({
            "@type": "ComicSeries",
            position: index + 1,
            "@id": `https://pekotoon.com/cartoon/${item.uuid}`,
            name: item.title,
            image: item.coverImage,
            author: {
                "@type": "Person",
                name: item.author.name,
                image: item.author.avatar,
            },
            genre: item.genres,
        })),
    };

    return (
        <>
            <CartoonCarousel
                title={title}
                items={items}
                className={className}
                totalItems={20}
                searchHref={searchHref}
            />
            <script
                type="application/ld+json"
                // This runs only on the server and is emitted once per carousel
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
            />
        </>
    );
}
