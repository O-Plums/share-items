"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider
      height="3px"
      color="#f43568"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <SessionProvider>{children}</SessionProvider>
    </ProgressProvider>
  );
}
