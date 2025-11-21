import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type Role = "buyer" | "seller";

interface SafeSessionUser {
  role?: Role;
  onboardingCompleted?: boolean;
}

function isSafeSessionUser(u: unknown): u is SafeSessionUser {
  return typeof u === "object" && u !== null && ("role" in u || "onboardingCompleted" in u);
}

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const user = (session as { user?: unknown } | null | undefined)?.user;

  const role: Role = isSafeSessionUser(user) ? (user.role ?? "buyer") : "buyer";
  const completed: boolean | undefined = isSafeSessionUser(user)
    ? user.onboardingCompleted
    : undefined;

  if (completed === false) {
    redirect("/onboarding/role");
  }

  redirect(role === "seller" ? "/seller-dashboard" : "/buyer-dashboard");
}
