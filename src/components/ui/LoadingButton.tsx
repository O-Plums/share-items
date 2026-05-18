"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const variants = {
  primary:
    "bg-brand-500 text-white active:bg-brand-600 disabled:opacity-50",
  secondary:
    "bg-white text-neutral-900 ring-1 ring-neutral-200 active:bg-neutral-50 disabled:opacity-50",
  danger:
    "bg-red-50 text-red-700 active:bg-red-100 disabled:opacity-50",
  success:
    "bg-emerald-500 text-white active:bg-emerald-600 disabled:opacity-50",
  ghost:
    "bg-transparent text-neutral-700 active:bg-neutral-100 disabled:opacity-50",
} as const;

export type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  variant?: keyof typeof variants;
  spinnerTone?: "brand" | "white" | "neutral";
  children: ReactNode;
};

export function LoadingButton({
  loading = false,
  loadingText,
  variant = "primary",
  spinnerTone,
  className,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  const tone =
    spinnerTone ?? (variant === "primary" || variant === "success" ? "white" : "brand");
  const showSpinner = loading;
  const label = loading && loadingText ? loadingText : children;

  const { type = "button", ...buttonProps } = props;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition",
        variants[variant],
        className,
      )}
      {...buttonProps}
    >
      {showSpinner && <Spinner size="sm" tone={tone} />}
      <span className={cn(showSpinner && "opacity-90")}>{label}</span>
    </button>
  );
}
