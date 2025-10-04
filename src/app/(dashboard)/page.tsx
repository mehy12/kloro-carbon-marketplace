import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";
import OverviewView from "@/modules/buyer/overview/overview-view";

export default async function OverviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }
  return <OverviewView />;
}
