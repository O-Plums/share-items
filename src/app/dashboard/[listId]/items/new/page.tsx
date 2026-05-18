"use client";

import { useParams } from "next/navigation";
import { ItemWizard } from "@/components/ItemWizard";

export default function NewItemPage() {
  const { listId } = useParams<{ listId: string }>();
  return <ItemWizard listId={listId} />;
}
