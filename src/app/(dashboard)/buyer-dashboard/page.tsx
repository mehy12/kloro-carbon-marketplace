"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import DashboardHeader from "@/components/layout/dashboard-header";
import OverviewView from "@/modules/buyer/overview/overview-view";

export default function BuyerDashboardPage() {
  return (
    <ProtectedRoute allowed={["buyer"]}>
      <div className="container mx-auto px-4">
        <DashboardHeader title="Carbon Exchange" linkLabel="Buyer Dashboard" linkHref="/buyer-dashboard" />
        <OverviewView />
      </div>
    </ProtectedRoute>
  );
}
