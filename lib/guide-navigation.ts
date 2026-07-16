export type GuideNavigationItem = {
  slug: string;
  label: string;
};

export type GuideNavigationGroup = {
  label: string;
  items: readonly GuideNavigationItem[];
};

export const GUIDE_NAVIGATION_GROUPS: readonly GuideNavigationGroup[] = [
  {
    label: "Väktarprovet",
    items: [
      { slug: "vaktarprov", label: "Översikt" },
      { slug: "vaktarprov/vu1-ovningsfragor", label: "VU1 övningsfrågor" },
      { slug: "vaktarprov/vu2-ovningsfragor", label: "VU2 övningsfrågor" },
    ],
  },
  {
    label: "Väktarutbildning",
    items: [
      { slug: "vaktarutbildning", label: "Utbildningsvägen" },
      { slug: "vaktarutbildning/vu1", label: "VU1" },
      { slug: "vaktarutbildning/vu2", label: "VU2" },
    ],
  },
  {
    label: "Yrket",
    items: [
      { slug: "bli-vaktare", label: "Bli väktare" },
      { slug: "vaktare-eller-ordningsvakt", label: "Väktare eller ordningsvakt" },
    ],
  },
  {
    label: "Lagstöd",
    items: [
      { slug: "lagstod/envarsgripande", label: "Envarsgripande" },
      { slug: "lagstod/nodvarn-och-nod", label: "Nödvärn och nöd" },
    ],
  },
  {
    label: "Studier",
    items: [{ slug: "studieteknik", label: "Studieteknik" }],
  },
  {
    label: "Om Vaktskolan",
    items: [
      { slug: "om-vaktskolan", label: "Om Vaktskolan" },
      { slug: "redaktionell-policy", label: "Redaktionell policy" },
      { slug: "kontakt", label: "Kontakt" },
    ],
  },
] as const;

export const GUIDE_NAVIGATION_SLUGS = GUIDE_NAVIGATION_GROUPS.flatMap((group) =>
  group.items.map((item) => item.slug),
);
