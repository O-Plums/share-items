import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-4 w-4 border-[2px]",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
} as const;

type SpinnerProps = {
  size?: keyof typeof sizes;
  className?: string;
  /** Couleur de l’anneau actif */
  tone?: "brand" | "white" | "neutral";
  label?: string;
};

const toneClass = {
  brand: "border-neutral-200 border-t-brand-500",
  white: "border-white/30 border-t-white",
  neutral: "border-neutral-200 border-t-neutral-600",
};

export function Spinner({ size = "md", className, tone = "brand", label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label ?? "Chargement"}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
    >
      <span
        className={cn(
          "animate-spin rounded-full",
          sizes[size],
          toneClass[tone],
        )}
      />
    </span>
  );
}
