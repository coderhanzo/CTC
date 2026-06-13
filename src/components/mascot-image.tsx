import Image from "next/image";

import { mascotCloseupUrl, mascotHeroUrl } from "@/src/lib/brand";

type MascotImageProps = {
  alt: string;
  className?: string;
  preload?: boolean;
  sizes: string;
  variant?: "hero" | "closeup";
};

export function MascotImage({
  alt,
  className,
  preload = false,
  sizes,
  variant = "hero",
}: MascotImageProps) {
  return (
    <Image
      alt={alt}
      className={className}
      fill
      preload={preload}
      sizes={sizes}
      src={variant === "closeup" ? mascotCloseupUrl : mascotHeroUrl}
    />
  );
}
