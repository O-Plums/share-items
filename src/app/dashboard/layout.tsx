import { IdentityGate } from "@/components/IdentityGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <IdentityGate
      title="Comment tu t’appelles ?"
      description="Ton prénom apparaîtra à côté de tes listes."
    >
      {children}
    </IdentityGate>
  );
}
