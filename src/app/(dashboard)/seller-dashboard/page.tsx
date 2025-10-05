"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import DashboardHeader from "@/components/layout/dashboard-header";
import SellerDashboard from "@/modules/seller/dashboard/seller-dashboard";

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute allowed={["seller"]}>
      <div className="container mx-auto px-4">
        <DashboardHeader title="Carbon Exchange" linkLabel="Seller Dashboard" linkHref="/seller-dashboard" />
        <SellerDashboard />
      </div>
    </ProtectedRoute>
  );
}
