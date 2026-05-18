import { redirect } from "next/navigation";

export default function LegacyNewListRedirect() {
  redirect("/dashboard/lists/new");
}
