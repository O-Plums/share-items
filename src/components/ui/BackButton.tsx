import Link from "next/link";
import type { ReactNode } from "react";

const baseClass =
  "inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm ring-2 ring-neutral-200 transition active:scale-[0.98] active:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50";

type BaseProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
};

type ButtonProps = BaseProps & {
  href?: never;
  onClick: () => void;
};

type Props = LinkProps | ButtonProps;

function BackArrow() {
  return (
    <span className="text-base leading-none" aria-hidden>
      ←
    </span>
  );
}

export function BackButton({ href, onClick, children, className = "", disabled }: Props) {
  const cls = `${baseClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cls}>
        <BackArrow />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      <BackArrow />
      {children}
    </button>
  );
}
