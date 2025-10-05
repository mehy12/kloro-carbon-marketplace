"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearRole, getRole } from "@/lib/role";
import DashboardUserButton from "@/modules/dashboard/dashboard-user-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function DashboardHeader({ title, linkLabel, linkHref }: { title?: string; linkLabel?: string; linkHref?: string }) {
  const router = useRouter();
  const role = typeof window !== "undefined" ? getRole() : null;

  const onLogout = () => {
    try { clearRole(); } catch {}
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-lg">🌱</span>
        <span className="font-semibold">{title ?? "Carbon Exchange"}</span>
      </div>
      <div className="flex items-center gap-3">
        {linkHref && linkLabel && (
          <Link href={linkHref} className="text-sm text-muted-foreground hover:text-foreground">
            {linkLabel}
          </Link>
        )}
        <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
        <DashboardUserButton />
      </div>
    </div>
  );
}
