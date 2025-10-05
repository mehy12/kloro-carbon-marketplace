import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import SignInView from "@/modules/auth/ui/views/sign-in-view";

export default async function SignIn() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    const role = (session.user?.role as "buyer" | "seller" | undefined) ?? "buyer";
    const completed = (session.user as any)?.onboardingCompleted as boolean | undefined;
    if (completed === false) {
      redirect("/onboarding/role");
    }
    redirect(role === "seller" ? "/seller-dashboard" : "/buyer-dashboard");
  }
  return <SignInView />;
}
