import type { SearchFilters } from "@/lib/types/search";

/**
 * Builds URLSearchParams from SearchFilters for use in search URLs
 */
export function buildSearchUrlParams(filters?: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

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

  return params;
}

/**
 * Builds search href from filters
 */
export function buildSearchHref(filters?: SearchFilters): string {
  const params = buildSearchUrlParams(filters);
  return params.toString() ? `/search?${params.toString()}` : "/search";
}


