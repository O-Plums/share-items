export type Taxonomy = Readonly<{ key: string; emoji: string; label: string }>;

export const ROOMS = [
  { key: "kitchen", emoji: "🍳", label: "Cuisine" },
  { key: "living", emoji: "🛋️", label: "Salon" },
  { key: "bedroom", emoji: "🛏️", label: "Chambre" },
  { key: "bathroom", emoji: "🚿", label: "Salle de bain" },
  { key: "laundry", emoji: "🧺", label: "Buanderie" },
  { key: "storage", emoji: "🏚️", label: "Cave / garage" },
  { key: "outdoor", emoji: "🌳", label: "Extérieur" },
  { key: "other_room", emoji: "❓", label: "Autre" },
] as const satisfies readonly Taxonomy[];

export const CATEGORIES = [
  { key: "electronics", emoji: "📺", label: "Électronique" },
  { key: "furniture", emoji: "🪑", label: "Mobilier" },
  { key: "dishes", emoji: "🍽️", label: "Vaisselle" },
  { key: "textile", emoji: "👕", label: "Textile" },
  { key: "decor", emoji: "🧸", label: "Déco" },
  { key: "diy", emoji: "🔧", label: "Bricolage" },
  { key: "other_category", emoji: "📦", label: "Autre" },
] as const satisfies readonly Taxonomy[];

export const ROOM_KEYS = ROOMS.map((r) => r.key) as readonly string[];
export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as readonly string[];

export function getRoom(key: string): Taxonomy | undefined {
  return ROOMS.find((r) => r.key === key);
}

export function getCategory(key: string): Taxonomy | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function isValidRoom(key: string): boolean {
  return ROOM_KEYS.includes(key);
}

export function isValidCategory(key: string): boolean {
  return CATEGORY_KEYS.includes(key);
}

export const VOTE_VALUES = ["YES", "NO"] as const;
export type VoteValue = (typeof VOTE_VALUES)[number];

export function isValidVoteValue(v: string): v is VoteValue {
  return v === "YES" || v === "NO";
}
