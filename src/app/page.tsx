import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  const role = (session.user?.role as "buyer" | "seller" | undefined) ?? "buyer";
  const completed = (session.user as any)?.onboardingCompleted as boolean | undefined;
  if (completed === false) {
    redirect("/onboarding/role");
  }
  redirect(role === "seller" ? "/seller-dashboard" : "/buyer-dashboard");
}
