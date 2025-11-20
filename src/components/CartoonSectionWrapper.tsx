import { CartoonSection } from "./CartoonSection";
import type { CartoonCardProps } from "./CartoonCard";

interface CartoonSectionWrapperProps {
  title: string;
  description?: string;
  items: CartoonCardProps[];
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

/**
 * Server-side rendered wrapper for CartoonSection
 * This component can be used in server components and passes data to the client component
 */
export function CartoonSectionWrapper({
  title,
  description,
  items,
  itemsPerView,
  className,
}: CartoonSectionWrapperProps) {
  return (
    <CartoonSection
      title={title}
      description={description}
      items={items}
      itemsPerView={itemsPerView}
      className={className}
    />
  );
}

