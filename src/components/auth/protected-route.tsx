"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getRole, Role } from "@/lib/role";

export default function ProtectedRoute({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    const role = getRole();
    if (!role || !allowed.includes(role)) {
      router.replace("/403");
    }
  }, [session, isPending, router, allowed]);

  return <>{children}</>;
}
