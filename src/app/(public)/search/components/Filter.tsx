"use client";

import { useState, useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Search, X, Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TYPE_MANGA,
  TYPE_NOVEL,
  TYPE_LABELS,
  ORIGIN_TYPE_THAI,
  ORIGIN_TYPE_JAPANESE,
  ORIGIN_TYPE_KOREAN,
  ORIGIN_TYPE_CHINESE,
  ORIGIN_TYPE_LABELS,
} from "@/lib/constants/cartoon.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/lib/types/search";

interface CategoryComboboxProps {
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  categories: { id: string; name: string }[];
}

function CategoryCombobox({
  value,
  onValueChange,
  categories,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedValues = Array.isArray(value)
    ? value
    : value === "all"
    ? []
    : [value];
  const selectedCategories = categories.filter((cat) =>
    selectedValues.includes(cat.id)
  );

  const displayValue =
    value === "all" || (Array.isArray(value) && value.length === 0)
      ? "ทั้งหมด"
      : selectedCategories.length === 0
      ? "เลือกหมวดหมู่"
      : selectedCategories.length === 1
      ? selectedCategories[0].name
      : `เลือกแล้ว ${selectedCategories.length} หมวดหมู่`;

  const handleToggle = (categoryId: string) => {
    const currentValues = Array.isArray(value)
      ? value
      : value === "all"
      ? []
      : [value];

    if (categoryId === "all") {
      onValueChange("all");
      return;
    }

    const newValues = currentValues.includes(categoryId)
      ? currentValues.filter((id) => id !== categoryId)
      : [...currentValues, categoryId];

    onValueChange(newValues.length === 0 ? "all" : newValues);
  };

  const isSelected = (categoryId: string) => {
    if (categoryId === "all") {
      return (
        value === "all" || (Array.isArray(value) && value.length === 0)
      );
    }
    const currentValues = Array.isArray(value)
      ? value
      : value === "all"
      ? []
      : [value];
    return currentValues.includes(categoryId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="ค้นหาหมวดหมู่..." />
          <CommandList>
            <CommandEmpty>ไม่พบหมวดหมู่</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  handleToggle("all");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    isSelected("all") ? "opacity-100" : "opacity-0"
                  )}
                />
                ทั้งหมด
              </CommandItem>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    handleToggle(category.id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected(category.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface FilterProps {
  initialFilters?: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
  onSearch?: (filters: SearchFilters) => void;
  mainCategories?: { id: string; name: string }[];
  subCategories?: { id: string; name: string }[];
}

export function Filter({
  initialFilters = {},
  onFilterChange,
  onSearch,
  mainCategories = [],
  subCategories = [],
}: FilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: initialFilters.name || "",
    cartoonType: initialFilters.cartoonType || "all",
    orderBy: initialFilters.orderBy || "views",
    mainCategory: initialFilters.mainCategory || "all",
    subCategory: initialFilters.subCategory || "all",
    age: initialFilters.age || "all",
    complete_status: initialFilters.complete_status || "all",
    original: initialFilters.original || "all",
  });

  const initialFiltersKey = JSON.stringify(initialFilters);
  useEffect(() => {
    setFilters({
      name: initialFilters.name || "",
      cartoonType: initialFilters.cartoonType || "all",
      orderBy: initialFilters.orderBy || "views",
      mainCategory: initialFilters.mainCategory || "all",
      subCategory: initialFilters.subCategory || "all",
      age: initialFilters.age || "all",
      complete_status: initialFilters.complete_status || "all",
      original: initialFilters.original || "all",
    });
  }, [initialFiltersKey]);

  const searchInput$ = useRef<Subject<string> | null>(null);
  const filtersRef = useRef(filters);
  const onFilterChangeRef = useRef(onFilterChange);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    filtersRef.current = filters;
    onFilterChangeRef.current = onFilterChange;
    onSearchRef.current = onSearch;
  }, [filters, onFilterChange, onSearch]);

  useEffect(() => {
    if (!searchInput$.current) {
      searchInput$.current = new Subject<string>();
    }

    const subscription = searchInput$.current
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        const newFilters = { ...filtersRef.current, name: searchValue };
        setFilters(newFilters);
        onFilterChangeRef.current?.(newFilters);
        onSearchRef.current?.(newFilters);
      });

    return () => {
      subscription.unsubscribe();
      if (searchInput$.current) {
        searchInput$.current.complete();
        searchInput$.current = null;
      }
    };
  }, []);

  const handleSearchInputChange = (value: string) => {
    const newFilters = { ...filters, name: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);

    if (searchInput$.current) {
      searchInput$.current.next(value);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      name: "",
      cartoonType: "all",
      orderBy: "views",
      mainCategory: "all",
      subCategory: "all",
      age: "all",
      complete_status: "all",
      original: "all",
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
    onSearch?.(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.name ||
      filters.cartoonType !== "all" ||
      filters.orderBy !== "views" ||
      filters.mainCategory !== "all" ||
      filters.subCategory !== "all" ||
      filters.age !== "all" ||
      filters.complete_status !== "all" ||
      filters.original !== "all"
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">ค้นหามังงะ</h1>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="ค้นหามังงะ..."
            value={filters.name || ""}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">ประเภท</label>
            <Select
              value={filters.cartoonType || "all"}
              onValueChange={(value) => handleFilterChange("cartoonType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value={TYPE_MANGA}>{TYPE_LABELS[TYPE_MANGA]}</SelectItem>
                <SelectItem value={TYPE_NOVEL}>{TYPE_LABELS[TYPE_NOVEL]}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">เรียงตาม</label>
            <Select
              value={filters.orderBy || "views"}
              onValueChange={(value) => handleFilterChange("orderBy", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">ยอดนิยม</SelectItem>
                <SelectItem value="likes">ถูกใจมากที่สุด</SelectItem>
                <SelectItem value="latest">ใหม่ล่าสุด</SelectItem>
                <SelectItem value="chapters">ตอนมากที่สุด</SelectItem>
                <SelectItem value="latest_update">อัปเดตล่าสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">หมวดหมู่หลัก</label>
            <CategoryCombobox
              value={
                Array.isArray(filters.mainCategory)
                  ? filters.mainCategory
                  : filters.mainCategory || "all"
              }
              onValueChange={(value) => handleFilterChange("mainCategory", value)}
              categories={mainCategories}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">หมวดหมู่ย่อย</label>
            <CategoryCombobox
              value={
                Array.isArray(filters.subCategory)
                  ? filters.subCategory
                  : filters.subCategory || "all"
              }
              onValueChange={(value) => handleFilterChange("subCategory", value)}
              categories={subCategories}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">อายุ</label>
            <Select
              value={filters.age || "all"}
              onValueChange={(value) => handleFilterChange("age", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="teen">13+</SelectItem>
                <SelectItem value="mature">18+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">สถานะ</label>
            <Select
              value={filters.complete_status || "all"}
              onValueChange={(value) => handleFilterChange("complete_status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="ongoing">ยังไม่จบ</SelectItem>
                <SelectItem value="completed">จบแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">ต้นฉบับ</label>
            <Select
              value={filters.original || "all"}
              onValueChange={(value) => handleFilterChange("original", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value={ORIGIN_TYPE_THAI.toString()}>
                  {ORIGIN_TYPE_LABELS[ORIGIN_TYPE_THAI]}
                </SelectItem>
                <SelectItem value={ORIGIN_TYPE_JAPANESE.toString()}>
                  {ORIGIN_TYPE_LABELS[ORIGIN_TYPE_JAPANESE]}
                </SelectItem>
                <SelectItem value={ORIGIN_TYPE_KOREAN.toString()}>
                  {ORIGIN_TYPE_LABELS[ORIGIN_TYPE_KOREAN]}
                </SelectItem>
                <SelectItem value={ORIGIN_TYPE_CHINESE.toString()}>
                  {ORIGIN_TYPE_LABELS[ORIGIN_TYPE_CHINESE]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground opacity-0">
              Placeholder
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters()}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                ล้างตัวกรอง
              </Button>
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                ค้นหา
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


