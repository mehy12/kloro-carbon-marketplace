import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AIInsightsView from "@/modules/buyer/ai/ai-insights-view";

export default async function AIInsightsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return <AIInsightsView />;
}