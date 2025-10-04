import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ComplianceView from "@/modules/buyer/compliance/compliance-view";

export default async function CompliancePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return <ComplianceView />;
}