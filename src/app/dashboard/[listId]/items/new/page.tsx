"use client";

import { useParams } from "next/navigation";
import { ItemWizard } from "@/components/ItemWizard";

export default function NewItemPage() {
  const { listId } = useParams<{ listId: string }>();
  return <ItemWizard mode={{ kind: "list", listId }} redirectTo={`/dashboard/${listId}?tab=items`} />;
}
