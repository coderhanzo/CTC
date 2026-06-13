import "server-only";

import { existsSync } from "node:fs";
import { join } from "node:path";

const supabaseMascotHeroUrl =
  "https://bfigorzuvcwiefiqvrfu.supabase.co/storage/v1/object/public/Crack%20The%20Code%20storage/ctc%20mascot.jpeg";

const publicAssetPath = (assetPath: string) =>
  join(process.cwd(), "public", assetPath.replace(/^\//, ""));

const existingPublicAsset = (assetPath: string) =>
  existsSync(publicAssetPath(assetPath)) ? assetPath : null;

export const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "CTC";
export const brandFullName =
  process.env.NEXT_PUBLIC_BRAND_FULL_NAME || "CrackTheCode";

export const mascotHeroUrl =
  process.env.NEXT_PUBLIC_MASCOT_HERO_URL ||
  existingPublicAsset("/assets/mascot-hero.jpg") ||
  existingPublicAsset("/assets/mascot-hero.jpeg") ||
  supabaseMascotHeroUrl;

export const mascotCloseupUrl =
  process.env.NEXT_PUBLIC_MASCOT_CLOSEUP_URL ||
  existingPublicAsset("/assets/mascot-closeup.jpg") ||
  existingPublicAsset("/assets/mascot-closeup.jpeg") ||
  mascotHeroUrl;

// Optional transparent (no-background) mascot cutout. When present we render it
// free-floating; otherwise the storefront frames the jpeg inside a rounded
// cutout so its background looks intentional.
export const mascotTransparentUrl =
  process.env.NEXT_PUBLIC_MASCOT_TRANSPARENT_URL ||
  existingPublicAsset("/assets/ctc-mascot-transparent.png") ||
  null;

export const deliveryNote =
  process.env.NEXT_PUBLIC_DELIVERY_NOTE ||
  "Currently delivering within Accra. Nationwide delivery coming soon.";

export const supportEmail =
  process.env.SUPPORT_EMAIL || "support@crackthecode.store";

export const supportPhone = process.env.SUPPORT_PHONE || "+233 00 000 0000";
