import { CartoonSection } from "./CartoonSection";

interface CartoonSectionWrapperProps {
  title: string;
  description?: string;
  cartoonType: "manga" | "novel";
  type: string; // e.g., "popular", "latest", "trending" - backend handles ordering logic
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

/**
 * Server-side rendered wrapper for CartoonSection
 * This component can be used in server components and passes configuration to the client component
 * The client component will fetch its own data based on the provided parameters
 * The backend will handle ordering logic based on the type parameter
 */
export function CartoonSectionWrapper({
  title,
  description,
  cartoonType,
  type,
  itemsPerView,
  className,
}: CartoonSectionWrapperProps) {
  return (
    <CartoonSection
      title={title}
      description={description}
      cartoonType={cartoonType}
      type={type}
      itemsPerView={itemsPerView}
      className={className}
    />
  );
}

