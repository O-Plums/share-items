import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { listShareMetadata } from "@/lib/site";
import { VoterApp } from "./VoterApp";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = await prisma.list.findUnique({
    where: { slug },
    select: { title: true },
  });
  if (!list) {
    return { title: "Liste introuvable" };
  }
  return listShareMetadata(list.title, slug);
}

export default async function VoterPage({ params }: Props) {
  const { slug } = await params;
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  return <VoterApp slug={slug} googleEnabled={googleEnabled} />;
}
