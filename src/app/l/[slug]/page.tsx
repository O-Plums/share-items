import { VoterApp } from "./VoterApp";

export default async function VoterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VoterApp slug={slug} />;
}
