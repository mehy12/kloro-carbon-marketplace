import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MarketView from "@/modules/buyer/market/market-view";
import DashboardHeader from "@/components/layout/dashboard-header";

export default async function MarketPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return (
    <div className="container mx-auto px-4">
      <DashboardHeader title="Carbon Exchange" linkLabel="Buyer Dashboard" linkHref="/buyer-dashboard" />
      <MarketView />
    </div>
  );
}
