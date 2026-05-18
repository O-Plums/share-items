import Image from "next/image";
import Link from "next/link";
import { LOGO_PATH, SITE_NAME } from "@/lib/site";

type Props = {
  size?: number;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

export function AppLogo({ size = 56, href = "/", className = "", priority = false }: Props) {
  const img = (
    <Image
      src={LOGO_PATH}
      alt={SITE_NAME}
      width={size}
      height={size}
      priority={priority}
      className={`rounded-2xl object-contain ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block shrink-0" aria-label={SITE_NAME}>
        {img}
      </Link>
    );
  }

  return img;
}
