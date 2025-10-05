"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Overview from "./components/overview";
import Projects from "./components/projects";
import ListCredits from "./components/list-credits";
import Orders from "./components/orders";
import Revenue from "./components/revenue";
import Verification from "./components/verification";
import Insights from "./components/insights";

export default function SellerDashboard() {
  const [tab, setTab] = React.useState<string>("overview");
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const q = searchParams.get("tab") ?? "overview";
    setTab(q);
  }, [searchParams]);

  const onChange = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", value);
    router.push(`/seller-dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={onChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="list">List Credits</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline">Add Project</Button>
            <Button>List Credits</Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-4"><Overview /></TabsContent>
        <TabsContent value="projects" className="mt-4"><Projects /></TabsContent>
        <TabsContent value="list" className="mt-4"><ListCredits /></TabsContent>
        <TabsContent value="orders" className="mt-4"><Orders /></TabsContent>
        <TabsContent value="revenue" className="mt-4"><Revenue /></TabsContent>
        <TabsContent value="verification" className="mt-4"><Verification /></TabsContent>
        <TabsContent value="insights" className="mt-4"><Insights /></TabsContent>
      </Tabs>

      {/* Mobile quick actions */}
      <Card className="md:hidden">
        <CardContent className="p-3 flex gap-2">
          <Button className="flex-1" variant="outline">Add Project</Button>
          <Button className="flex-1">List Credits</Button>
        </CardContent>
      </Card>
    </div>
  );
}
