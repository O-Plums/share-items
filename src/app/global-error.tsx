"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Root-level error boundary — fires only if the regular `error.tsx` or the
 * root layout itself fails. Must render its own <html>/<body> and cannot use
 * any i18n / providers (those are likely the source of the crash).
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[global-error.tsx]", error);
    }
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          color: "#171717",
          background: "#fafafa",
        }}
      >
        <p
          aria-hidden
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            color: "#f43568",
            margin: 0,
          }}
        >
          500
        </p>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
          Une erreur est survenue
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#525252", maxWidth: 360, margin: 0 }}>
          Recharge la page, ou reviens à l'accueil.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "2px solid #e5e5e5",
              background: "#fff",
              borderRadius: 16,
              padding: "0.75rem 1.25rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          <a
            href="/"
            style={{
              background: "#f43568",
              color: "#fff",
              borderRadius: 16,
              padding: "0.75rem 1.25rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Retour à l'accueil
          </a>
        </div>
      </body>
    </html>
  );
}
