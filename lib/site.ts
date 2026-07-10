export const SITE_NAME = "Vaktskolan";
export const SITE_DESCRIPTION =
  "Fristående provträning och källstödda guider för dig som studerar inför väktarutbildningens VU1 och VU2.";

export function getSiteUrl(): URL {
  const configured = process.env.SITE_URL?.trim();
  return new URL(configured || "https://vaktskolan.se");
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}

export const EDITORIAL_AUTHOR = "Vaktskolans redaktion";

export const PRIMARY_NAVIGATION = [
  { href: "/vaktarprov", label: "Väktarprovet" },
  { href: "/vaktarutbildning", label: "VU1 & VU2" },
  { href: "/bli-vaktare", label: "Bli väktare" },
  { href: "/studieteknik", label: "Studieteknik" },
] as const;
