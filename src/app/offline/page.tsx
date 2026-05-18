import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";

export const metadata = {
  title: "Hors ligne",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <AppLogo size={72} href="/" />
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Tu es hors ligne</h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">
          Reconnecte-toi à Internet pour voter, gérer tes listes ou synchroniser tes objets.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Réessayer
      </Link>
    </main>
  );
}
