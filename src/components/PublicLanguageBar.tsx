"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";

export function PublicLanguageBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end px-3 pt-3 safe-top">
      <div className="pointer-events-auto">
        <LanguageSwitcher compact />
      </div>
    </div>
  );
}
