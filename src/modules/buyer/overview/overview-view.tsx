"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";

export default function OverviewView() {
  const compliant = true;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Emissions" value="45,000 tCO₂e" trend="-2% MoM" trendUp={false} />
        <StatCard title="Allowed Target" value="43,500 tCO₂e" trend="FY 2025-26" />
        <StatCard title="Owned Credits" value="28,000" trend="+1,200 this month" trendUp />
        <StatCard title="Retired Credits" value="12,500" trend="+500 this month" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Compliance Status</h3>
              {compliant ? (
                <Badge className="flex items-center gap-1" variant="default"><ShieldCheck className="size-4" /> Compliant</Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="size-4" /> At Risk</Badge>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress to Target</span>
                <span>83%</span>
              </div>
              <Progress value={83} />
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Shortfall</div>
                  <div className="font-medium">2,000 credits</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Deadline</div>
                  <div className="font-medium">March 2026</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">AI Insight</h3>
            <p className="text-sm text-muted-foreground">
              You should purchase 2,000 Nature-Based Credits by March 2026 to remain compliant.
            </p>
            <div className="flex gap-2">
              <Button size="sm">Buy Credits</Button>
              <Button variant="outline" size="sm">Retire Credits</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Quick Actions</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm">Buy Credits</Button>
            <Button size="sm" variant="outline">View Portfolio</Button>
            <Button size="sm" variant="outline">Retire Credits</Button>
            <Button size="sm" variant="outline">Generate Compliance Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp }: { title: string; value: string; trend?: string; trendUp?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trendUp === undefined ? null : trendUp ? (
              <TrendingUp className="size-4 text-emerald-500" />
            ) : (
              <TrendingDown className="size-4 text-rose-500" />
            )}
            <span className="text-muted-foreground">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}