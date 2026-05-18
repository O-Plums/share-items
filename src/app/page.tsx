import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between px-6 py-10">
        <header>
          <p className="text-sm font-medium uppercase tracking-widest text-brand-500">
            Share Items
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-neutral-900">
            Tes objets, les bonnes mains.
          </h1>
          <p className="mt-4 text-neutral-600">
            Photographie ce dont tu veux te débarrasser, fais voter tes proches façon Tinder, et attribue chaque objet à la personne qui le récupèrera.
          </p>
        </header>

        <section className="my-12 space-y-3">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <p className="text-2xl">📸 1. Photographie</p>
            <p className="mt-1 text-sm text-neutral-600">
              Une photo + 2 emojis (pièce + type). Pas besoin de taper.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <p className="text-2xl">💬 2. Fais voter</p>
            <p className="mt-1 text-sm text-neutral-600">
              Tes proches swipent oui / non. Aucun compte à créer.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <p className="text-2xl">🤝 3. Attribue</p>
            <p className="mt-1 text-sm text-neutral-600">
              Choisis qui repart avec quoi. La personne voit son objet dans « Matchs ».
            </p>
          </div>
        </section>

        <nav className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full rounded-2xl bg-brand-500 px-4 py-4 text-center text-lg font-semibold text-white transition active:bg-brand-600"
          >
            Créer une liste
          </Link>
          <p className="text-center text-sm text-neutral-500">
            Tu as reçu un lien ? Ouvre-le simplement.
          </p>
        </nav>
      </div>
    </main>
  );
}
