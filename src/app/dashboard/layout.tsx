import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AppLogo } from "@/components/AppLogo";
import { UserRoomsProvider } from "@/components/UserRoomsProvider";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardNav } from "./DashboardNav";
import { ClaimVisitorListsTrigger } from "./ClaimVisitorListsTrigger";
import { PostSignupSync } from "@/components/PostSignupSync";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/lists");
  }

  const user = session.user;

  return (
    <UserRoomsProvider>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-3 safe-top">
          <AppLogo size={40} href="/dashboard/lists" />
          <DashboardHeader
            name={user.name ?? user.email ?? "Toi"}
            image={user.image ?? null}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          />
        </header>
        <div className="flex-1">{children}</div>
        <DashboardNav />
      </div>
      <ClaimVisitorListsTrigger />
      <PostSignupSync />
      <PullToRefresh />
      <PwaInstallPrompt />
    </UserRoomsProvider>
  );
}
