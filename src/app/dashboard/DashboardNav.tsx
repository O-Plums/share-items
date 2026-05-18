"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname() ?? "";
  const onInventory = pathname.startsWith("/dashboard/inventory");
  const onLists =
    pathname === "/dashboard/lists" ||
    pathname.startsWith("/dashboard/lists/") ||
    (/^\/dashboard\/[^/]+$/.test(pathname) && !onInventory);

  const isListDetail =
    /^\/dashboard\/[^/]+$/.test(pathname) &&
    pathname !== "/dashboard/lists" &&
    !pathname.startsWith("/dashboard/inventory");

  const hide = /\/(new|edit)(?:$|\/)/.test(pathname) || isListDetail;
  if (hide) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 safe-bottom">
      <div className="mx-auto w-full max-w-md px-3 pb-2">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-neutral-200">
          <Link
            href="/dashboard/lists"
            className={`rounded-xl py-2.5 text-center text-sm font-medium ${
              onLists ? "bg-brand-500 text-white" : "text-neutral-700"
            }`}
          >
            📋 Listes
          </Link>
          <Link
            href="/dashboard/inventory"
            className={`rounded-xl py-2.5 text-center text-sm font-medium ${
              onInventory ? "bg-brand-500 text-white" : "text-neutral-700"
            }`}
          >
            📦 Inventaire
          </Link>
        </div>
      </div>
    </div>
  );
}
