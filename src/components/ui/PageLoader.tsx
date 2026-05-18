import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type PageLoaderProps = {
  label?: string;
  className?: string;
};

export function PageLoader({ label = "Chargement…", className }: PageLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10", className)}>
      <Spinner size="lg" label={label} />
      {label && <p className="text-sm font-medium text-neutral-500">{label}</p>}
    </div>
  );
}
