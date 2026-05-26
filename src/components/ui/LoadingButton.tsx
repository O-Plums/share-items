"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const variants = {
  primary:
    "bg-primary-500 text-white active:bg-primary-600 disabled:opacity-50",
  voter:
    "bg-secondary-500 text-white active:bg-secondary-600 disabled:opacity-50",
  secondary:
    "bg-white text-neutral-900 ring-1 ring-neutral-200 active:bg-neutral-50 disabled:opacity-50",
  danger:
    "bg-danger-50 text-danger-700 active:bg-danger-100 disabled:opacity-50",
  success:
    "bg-success-500 text-white active:bg-success-600 disabled:opacity-50",
  ghost:
    "bg-transparent text-neutral-700 active:bg-neutral-100 disabled:opacity-50",
} as const;

export type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  variant?: keyof typeof variants;
  spinnerTone?: "brand" | "white" | "neutral" | "voter";
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
    spinnerTone ??
    (variant === "primary" || variant === "success" || variant === "voter"
      ? "white"
      : "brand");
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
