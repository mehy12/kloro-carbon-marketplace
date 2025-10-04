import React from "react";
import Link from "next/link";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

export default function layout({ children }: Props) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link href="/" className="font-semibold text-lg">
                Carbon Credit Trading Portal — Buyer Dashboard
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/" className="text-sm px-3 py-2 rounded-md hover:bg-muted">Overview</Link>
              <Link href="/market" className="text-sm px-3 py-2 rounded-md hover:bg-muted">Market</Link>
              <Link href="/portfolio" className="text-sm px-3 py-2 rounded-md hover:bg-muted">My Portfolio</Link>
              <Link href="/transactions" className="text-sm px-3 py-2 rounded-md hover:bg-muted">Transactions</Link>
              <Link href="/compliance" className="text-sm px-3 py-2 rounded-md hover:bg-muted">Compliance</Link>
              <Link href="/ai-insights" className="text-sm px-3 py-2 rounded-md hover:bg-muted">AI Insights</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button size="sm" className="hidden sm:inline-flex">Buy Credits</Button>
              <Button variant="outline" size="sm" className="hidden md:inline-flex">Retire Credits</Button>
              <Button variant="outline" size="sm" className="hidden lg:inline-flex">Compliance Report</Button>
              <Button variant="ghost" size="sm">Ask AI</Button>
            </div>
          </div>
        </header>
        <main className="flex flex-col min-h-[calc(100svh-56px)] p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
