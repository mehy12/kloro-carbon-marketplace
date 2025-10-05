"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, BarChart, Bar } from "recharts";

const salesData = [
  { month: "Jan", sales: 1200 },
  { month: "Feb", sales: 2100 },
  { month: "Mar", sales: 1800 },
  { month: "Apr", sales: 2600 },
  { month: "May", sales: 3000 },
  { month: "Jun", sales: 2800 },
];

const listingsData = [
  { name: "Forestry", value: 45 },
  { name: "Renewable", value: 30 },
  { name: "Waste", value: 15 },
  { name: "Industrial", value: 10 },
];

export default function Overview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Snapshot cards */}
      <StatCard title="Total Credits Issued" value={"2,50,000"} sub="All projects" />
      <StatCard title="Credits Sold" value={"1,35,400"} sub="Last 12 months" />
      <StatCard title="Revenue Earned" value={"₹18,72,300"} sub="Net of fees" />
      
      {/* Sales trend */}
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Sales Trend</div>
            <Button size="sm" variant="outline">View Transactions</Button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active listings by type */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Active Listings by Type</div>
            <Button size="sm" variant="outline">Manage</Button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card className="lg:col-span-3">
        <CardContent className="p-4">
          <div className="font-semibold mb-2">Quick Actions</div>
          <Separator className="my-3" />
          <div className="flex flex-wrap gap-2">
            <Button>Add Project</Button>
            <Button variant="outline">List Credits</Button>
            <Button variant="outline">View Transactions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
