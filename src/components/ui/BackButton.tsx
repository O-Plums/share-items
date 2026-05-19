import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function BackButton({ href, children, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm ring-2 ring-neutral-200 transition active:scale-[0.98] active:bg-neutral-50 ${className}`}
    >
      <span className="text-base leading-none" aria-hidden>
        ←
      </span>
      {children}
    </Link>
  );
}
