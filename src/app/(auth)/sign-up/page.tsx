import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import SignUpView from "@/modules/auth/ui/views/sign-up-view";

export default async function SignUp() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    redirect("/");
  }

  return <SignUpView />;
}
