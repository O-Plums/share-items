import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AppLogo } from "@/components/AppLogo";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardNav } from "./DashboardNav";
import { ClaimVisitorListsTrigger } from "./ClaimVisitorListsTrigger";

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
    <>
      <div className="fixed left-3 top-3 z-30 safe-top">
        <AppLogo size={40} href="/dashboard/lists" />
      </div>
      <DashboardHeader
        name={user.name ?? user.email ?? "Toi"}
        image={user.image ?? null}
        signOutAction={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      />
      <ClaimVisitorListsTrigger />
      {children}
      <DashboardNav />
    </>
  );
}
