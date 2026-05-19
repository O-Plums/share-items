"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ItemWizard } from "@/components/ItemWizard";
import { ITEM_TOUR_QUERY_PARAM } from "@/lib/first-list-tour";

export default function NewItemPage() {
  const { listId } = useParams<{ listId: string }>();
  const searchParams = useSearchParams();
  const itemTour = searchParams.get(ITEM_TOUR_QUERY_PARAM) === "1";

  return (
    <ItemWizard
      mode={{ kind: "list", listId }}
      redirectTo={`/dashboard/${listId}?tab=items`}
      guidedTour={itemTour}
    />
  );
}
