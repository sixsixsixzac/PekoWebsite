"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Filter } from "./Filter";
import { SearchResults } from "./SearchResults";
import type { SearchFilters } from "@/lib/types/search";
import {
  TYPE_MANGA,
  TYPE_NOVEL,
  ORIGIN_TYPE_THAI,
  ORIGIN_TYPE_JAPANESE,
  ORIGIN_TYPE_KOREAN,
  ORIGIN_TYPE_CHINESE,
} from "@/lib/constants/cartoon.constants";

interface SearchPageClientProps {
  mainCategories: { id: string; name: string }[];
  subCategories: { id: string; name: string }[];
  initialFilters?: SearchFilters;
}

export function SearchPageClient({
  mainCategories,
  subCategories,
  initialFilters,
}: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const defaultFilters: SearchFilters = {
    name: "",
    cartoonType: "all",
    orderBy: "views",
    mainCategory: "all",
    subCategory: "all",
    age: "all",
    complete_status: "all",
    original: "all",
  };

  const searchParamsString = searchParams.toString();
  const urlFilters = useMemo(() => {
    const filters: SearchFilters = { ...defaultFilters };

    const name = searchParams.get("name");
    if (name) filters.name = name;

    const cartoonType = searchParams.get("cartoonType");
    if (cartoonType && (cartoonType === TYPE_MANGA || cartoonType === TYPE_NOVEL)) {
      filters.cartoonType = cartoonType;
    }

    const orderBy = searchParams.get("orderBy");
    if (
      orderBy &&
      ["views", "likes", "latest", "chapters", "latest_update"].includes(orderBy)
    ) {
      filters.orderBy = orderBy as
        | "views"
        | "likes"
        | "latest"
        | "chapters"
        | "latest_update";
    }

    const mainCategory = searchParams.get("mainCategory");
    if (mainCategory) {
      filters.mainCategory = mainCategory;
    }

    const subCategory = searchParams.get("subCategory");
    if (subCategory) {
      filters.subCategory = subCategory;
    }

    const age = searchParams.get("age");
    if (age && ["all", "teen", "mature"].includes(age)) {
      filters.age = age as "all" | "teen" | "mature";
    }

    const complete_status = searchParams.get("complete_status");
    if (complete_status && ["all", "completed", "ongoing"].includes(complete_status)) {
      filters.complete_status = complete_status as "all" | "completed" | "ongoing";
    }

    const original = searchParams.get("original");
    const validOriginTypes = [
      "all",
      ORIGIN_TYPE_THAI.toString(),
      ORIGIN_TYPE_JAPANESE.toString(),
      ORIGIN_TYPE_KOREAN.toString(),
      ORIGIN_TYPE_CHINESE.toString(),
    ];
    if (original && validOriginTypes.includes(original)) {
      filters.original = original as "all" | "1" | "2" | "3" | "4";
    }

    return filters;
  }, [searchParamsString, searchParams]);

  const mergedFilters = useMemo(() => {
    const hasUrlParams = searchParamsString.length > 0;
    if (hasUrlParams) {
      return urlFilters;
    }
    if (initialFilters) {
      return { ...defaultFilters, ...initialFilters };
    }
    return defaultFilters;
  }, [urlFilters, initialFilters, searchParamsString]);

  const [filters, setFilters] = useState<SearchFilters>(mergedFilters);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(mergedFilters);

  useEffect(() => {
    setFilters(mergedFilters);
    setSearchFilters(mergedFilters);
  }, [mergedFilters]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (nextSearchFilters: SearchFilters) => {
    setFilters(nextSearchFilters);
    setSearchFilters(nextSearchFilters);
  };

  return (
    <>
      <Filter
        initialFilters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        mainCategories={mainCategories}
        subCategories={subCategories}
      />
      <SearchResults filters={searchFilters} />
    </>
  );
}


