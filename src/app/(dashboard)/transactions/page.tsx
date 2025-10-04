import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TransactionsView from "@/modules/buyer/transactions/transactions-view";

export default async function TransactionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return <TransactionsView />;
}