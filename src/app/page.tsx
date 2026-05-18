import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { SITE_TAGLINE } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col overflow-hidden safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-4 px-5 py-6 sm:py-8">
        <header className="text-center">
          <div className="flex justify-center">
            <AppLogo size={72} href={null} priority />
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-2 text-sm leading-snug text-neutral-600 sm:text-base">
            Photographie, fais voter tes proches façon Tinder, attribue chaque objet à la bonne
            personne.
          </p>
        </header>

        <section className="space-y-2">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="text-lg font-semibold">📸 1. Photographie</p>
            <p className="mt-0.5 text-sm text-neutral-600">
              Une photo + 2 emojis. Pas besoin de taper.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="text-lg font-semibold">💬 2. Fais voter</p>
            <p className="mt-0.5 text-sm text-neutral-600">Tes proches swipent oui / non.</p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="text-lg font-semibold">🤝 3. Attribue</p>
            <p className="mt-0.5 text-sm text-neutral-600">
              La personne voit son objet dans « Matchs ».
            </p>
          </div>
        </section>

        <nav className="space-y-2 pb-1">
          <Link
            href="/dashboard"
            className="block w-full rounded-2xl bg-brand-500 px-4 py-3.5 text-center text-lg font-semibold text-white transition active:bg-brand-600"
          >
            Créer une liste
          </Link>
          <p className="text-center text-xs text-neutral-500 sm:text-sm">
            Tu as reçu un lien ? Ouvre-le simplement.
          </p>
        </nav>
      </div>
    </main>
  );
}
