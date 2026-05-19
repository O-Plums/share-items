"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/** Subtle motion when children are added, removed, or reordered. Respects prefers-reduced-motion. */
const ANIMATE_OPTIONS = { duration: 220, easing: "ease-in-out" } as const;

type AllowedTag = "div" | "ul" | "ol" | "section" | "nav";

type Props<T extends AllowedTag = "div"> = {
  as?: T;
  children: ReactNode;
} & ComponentPropsWithoutRef<T>;

export function AnimateIn<T extends AllowedTag = "div">({
  as,
  children,
  ...props
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  const [ref] = useAutoAnimate(ANIMATE_OPTIONS);

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
}
