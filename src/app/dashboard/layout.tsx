import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardNav } from "./DashboardNav";
import { ClaimVisitorListsTrigger } from "./ClaimVisitorListsTrigger";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/lists");
  }

  const user = session.user;

  return (
    <>
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
