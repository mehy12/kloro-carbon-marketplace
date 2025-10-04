import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PortfolioView from "@/modules/buyer/portfolio/portfolio-view";

export default async function PortfolioPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return <PortfolioView />;
}