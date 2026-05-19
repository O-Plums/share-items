"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CATEGORIES, ROOMS, type Taxonomy } from "@/lib/taxonomies";
import { LIST_KINDS } from "@/lib/list-kinds";

export function useTranslatedRooms(): readonly Taxonomy[] {
  const t = useTranslations("taxonomies.rooms");
  return useMemo(() => ROOMS.map((r) => ({ ...r, label: t(r.key) })), [t]);
}

export function useTranslatedCategories(): readonly Taxonomy[] {
  const t = useTranslations("taxonomies.categories");
  return useMemo(() => CATEGORIES.map((c) => ({ ...c, label: t(c.key) })), [t]);
}

export function useTranslatedListKinds() {
  const t = useTranslations("listKinds");
  return useMemo(() => LIST_KINDS.map((k) => ({ ...k, label: t(k.key) })), [t]);
}

export function useRoomLabel(key: string, fallback?: string) {
  const t = useTranslations("taxonomies.rooms");
  if (ROOMS.some((r) => r.key === key)) return t(key);
  return fallback ?? key;
}

export function useCategoryLabel(key: string) {
  const t = useTranslations("taxonomies.categories");
  return t(key);
}
