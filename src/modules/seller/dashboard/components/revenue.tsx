"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";

const revenueData = [
  { month: "Jan", value: 120000 },
  { month: "Feb", value: 145000 },
  { month: "Mar", value: 132000 },
  { month: "Apr", value: 170000 },
  { month: "May", value: 162000 },
  { month: "Jun", value: 188000 },
];

function formatINR(n: number) { return n.toLocaleString("en-IN"); }
function formatCurrency(n: number) { return `₹${formatINR(Math.round(n))}`; }

export default function Revenue() {
  const [bank, setBank] = useState({ account: "", ifsc: "", name: "" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <div className="font-semibold mb-2">Revenue Trend</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-semibold">Revenue Summary</div>
          <Row label="Total Revenue" value={formatCurrency(1245000)} />
          <Row label="Pending Settlements" value={formatCurrency(152000)} />
          <Row label="Withdrawn" value={formatCurrency(820000)} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">Withdrawal</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Account Holder Name" value={bank.name} onChange={(e)=>setBank({...bank, name: e.target.value})} />
            <Input placeholder="Account Number" value={bank.account} onChange={(e)=>setBank({...bank, account: e.target.value})} />
            <Input placeholder="IFSC Code" value={bank.ifsc} onChange={(e)=>setBank({...bank, ifsc: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Save Details</Button>
            <Button>Request Payout</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-semibold">Fee Breakdown</div>
          <div className="text-sm text-muted-foreground">Example (per 10 credits at ₹1,250):</div>
          <Row label="Platform Fee (2%)" value={formatCurrency(250)} />
          <Row label="Verification Fee (0.5%)" value={formatCurrency(62.5)} />
          <div className="border-t pt-2">
            <Row label="Net Receivable" value={"₹11,970"} bold />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
