import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, BookOpen, CheckCircle2, Clock, Heart } from "lucide-react";
import { cn, getBlurDataURL } from "@/lib/utils";

export interface CartoonCardProps {
  id: string;
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
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function CartoonCardComponent({
  id,
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
}: CartoonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
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
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={`${title} cover image`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-opacity duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          quality={85}
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Blurred overlay that fades out when image loads - more performant than blurring the full image */}
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500 pointer-events-none",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{
            backgroundImage: `url(${coverImage})`,
            filter: "blur(20px)",
            transform: "scale(1.1)", // Slight scale to hide blur edges
          }}
        />
        
        {/* New Badge */}
        {isNew && (
          <div className="absolute left-2 top-2 z-10">
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
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5 shrink-0" aria-hidden="true" />
            <span itemProp="interactionStatistic">
              {formatNumber(views)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formatNumber(likes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{chapters}</span>
          </div>
        </div>
      </div>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ComicSeries",
            "@id": `https://pekotoon.com/cartoon/${id}`,
            name: title,
            image: coverImage,
            author: {
              "@type": "Person",
              name: author.name,
              image: author.avatar,
            },
            genre: genres,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: views > 0 ? "4.5" : "0",
              ratingCount: views,
            },
          }),
        }}
      />
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
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

