import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";
import { HomeView } from "@/modules/home/ui/views/home-view";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }
  return (
    <div>
      <HomeView />
    </div>
  );
}
