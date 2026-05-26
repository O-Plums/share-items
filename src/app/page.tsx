import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HomeLanding } from "@/components/home/HomeLanding";
import { homeJsonLd } from "@/lib/site";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard/lists");
  }

  const jsonLd = homeJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeLanding />
    </>
  );
}

