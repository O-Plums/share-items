import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HomeLanding } from "@/components/home/HomeLanding";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard/lists");
  }

  return <HomeLanding />;
}
