import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AppLogo } from "@/components/AppLogo";

type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard/lists";

  if (session?.user) {
    redirect(callbackUrl);
  }

  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const appleEnabled = Boolean(
    process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET,
  );

  return (
    <main className="flex min-h-screen flex-col safe-top safe-bottom">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <header className="text-center">
          <div className="flex justify-center">
            <AppLogo size={72} href="/" />
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-neutral-900">
            Connexion
          </h1>
          <p className="mt-2 text-neutral-600">
            Connecte-toi pour retrouver tes listes sur tous tes appareils.
          </p>
        </header>

        {params.error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Une erreur s’est produite ({params.error}). Réessaie.
          </div>
        )}

        {!googleEnabled && !appleEnabled && (
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Aucun fournisseur OAuth n’est configuré. Ajoute{" "}
            <code className="font-mono">AUTH_GOOGLE_ID</code>/
            <code className="font-mono">AUTH_GOOGLE_SECRET</code> ou{" "}
            <code className="font-mono">AUTH_APPLE_ID</code>/
            <code className="font-mono">AUTH_APPLE_SECRET</code> dans{" "}
            <code className="font-mono">.env</code>.
          </div>
        )}

        <div className="mt-8 space-y-3">
          {googleEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-base font-semibold text-neutral-900 ring-1 ring-neutral-200 transition active:bg-neutral-50"
              >
                <GoogleLogo />
                Continuer avec Google
              </button>
            </form>
          )}

          {appleEnabled && (
            <form
              action={async () => {
                "use server";
                await signIn("apple", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-4 py-4 text-base font-semibold text-white transition active:bg-neutral-800"
              >
                <AppleLogo />
                Continuer avec Apple
              </button>
            </form>
          )}
        </div>

        <div className="mt-10 rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
          <p className="text-sm font-medium text-neutral-900">
            Tu as reçu un lien pour voter ?
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Ouvre-le directement, aucun compte n’est requis pour swiper.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zM21 17.21c-.534 1.21-.794 1.76-1.49 2.84-.97 1.5-2.34 3.37-4.04 3.39-1.51.01-1.9-.97-3.95-.96-2.05.01-2.48.98-3.99.97C5.83 23.43 4.53 21.74 3.56 20.24 1.04 16.13.65 11.31 2.36 8.78 3.58 6.96 5.51 5.9 7.32 5.9c1.84 0 3 .99 4.52.99 1.48 0 2.38-.99 4.51-.99 1.61 0 3.31.86 4.52 2.35-3.97 2.16-3.32 7.81.13 8.96z" />
    </svg>
  );
}
