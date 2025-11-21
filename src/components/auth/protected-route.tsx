"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getRole, Role } from "@/lib/role";

interface SafeSessionUser {
  role?: Role;
}

interface SafeSession {
  user?: SafeSessionUser;
}

export default function ProtectedRoute({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    // fully typed version of session.user.role
    const typedSession = session as SafeSession;
    const sessionRole = typedSession.user?.role ?? null;

    const role = sessionRole ?? getRole();

    if (!role || !allowed.includes(role)) {
      router.replace("/403");
    }
  }, [session, isPending, router, allowed]);

  return <>{children}</>;
}
