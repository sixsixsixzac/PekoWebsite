import Link from "next/link";
import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, BookOpen, CheckCircle2, Clock, Heart, CheckCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/common/OptimizedImage";

export interface CartoonCardProps {
  uuid: string;
  title: string;
  coverImage: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  genres: string[];
  views: number;
  chapters: number;
  likes: number;
  isNew?: boolean;
  priority?: boolean;
  className?: string;
  href?: string;
  type?: "manga" | "novel";
  complete_status?: "completed" | "ongoing";
  ageRate?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function CartoonCardComponent({
  uuid,
  title,
  coverImage,
  author,
  genres,
  views,
  chapters,
  likes,
  isNew = false,
  priority = false,
  className,
  href,
  type,
  complete_status,
  ageRate,
}: CartoonCardProps) {
  // Generate href from type and uuid if href is not provided
  // Format: /manga/uuid or /novel/uuid
  const generatedHref = href || (type && uuid ? `/${type}/${uuid}` : undefined);

  const cardContent = (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card shadow-sm cursor-pointer",
        className
      )}
      itemScope
      itemType="https://schema.org/ComicSeries"
    >
      {/* Cover Image Container */}
      <div className="relative w-full h-[250px] md:aspect-[3/4] md:h-auto overflow-hidden bg-muted">
        <OptimizedImage
          src={coverImage}
          alt={`${title} cover image`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          quality={70}
          fallbackText={title}
          itemProp="image"
        />

        {/* Completion Status Badge */}
        {complete_status && (
          <div className="absolute left-2 top-2 z-10">
            <div
              className={cn(
                "flex items-center justify-center rounded-full p-1.5 shadow-lg",
                // Removed backdrop-blur-sm to reduce paint complexity
                "bg-white/40"
              )}
              title={complete_status === "completed" ? "จบแล้ว" : "ยังไม่จบ"}
            >
              {complete_status === "completed" ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : (
                <PlayCircle className="size-4 text-yellow-500" />
              )}
            </div>
          </div>
        )}

        {/* Age Rate Badge */}
        {ageRate && ageRate !== "all" && (
          <div className="absolute right-2 top-2 z-10">
            <div className="flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
              <span>
                {ageRate === "18+" ? "18+" : ageRate === "teen" ? "13+" : ageRate === "mature" ? "18+" : ageRate.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* New Badge */}
        {isNew && (
          <div className={cn(
            "absolute z-10",
            complete_status && !ageRate ? "right-2 top-2" : complete_status ? "right-2 top-10" : "left-2 top-2"
          )}>
            <div className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-[10px] font-semibold text-black">
              <Clock className="size-3" />
              <span>ใหม่</span>
            </div>
          </div>
        )}

        {/* Title Overlay (for mobile/tablet) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 md:hidden">
          <h3
            className="text-sm font-bold text-white line-clamp-1"
            itemProp="name"
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title (Desktop) */}
        <div className="hidden md:block">
          <h3
            className="text-base font-bold text-card-foreground line-clamp-1 truncate group-hover:text-primary transition-colors"
            itemProp="name"
          >
            {title}
          </h3>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarImage
              src={author.avatar}
              alt={`${author.name} avatar`}
              itemProp="image"
            />
            <AvatarFallback className="text-xs">
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="truncate text-sm text-muted-foreground"
              itemProp="author"
            >
              {author.name}
            </span>
            {author.verified && (
              <CheckCircle2
                className="size-3.5 shrink-0 text-blue-500"
                aria-label="Verified author"
              />
            )}
          </div>
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {genres.slice(0, 2).map((genre, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs font-normal max-w-[calc(50%-6px)] truncate"
                itemProp="genre"
                title={genre}
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Eye className="size-3.5 shrink-0 transition-colors group-hover:text-blue-500" aria-hidden="true" />
            <span itemProp="interactionStatistic" className="whitespace-nowrap">
              {formatNumber(views)}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Heart className="size-3.5 shrink-0 transition-colors group-hover:text-red-500" aria-hidden="true" />
            <span className="whitespace-nowrap">{formatNumber(likes)}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <BookOpen className="size-3.5 shrink-0 transition-colors group-hover:text-green-500" aria-hidden="true" />
            <span className="whitespace-nowrap">{chapters}</span>
          </div>
        </div>
      </div>
    </article>
  );

  if (generatedHref) {
    return (
      <Link
        href={generatedHref}
        className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg cursor-pointer"
        aria-label={`View ${title} cartoon`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export const CartoonCard = memo(CartoonCardComponent);

