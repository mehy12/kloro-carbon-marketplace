"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ComplianceView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Metric label="Emission Intensity Target (GEI)" value="0.82 tCO₂e/ton" />
          <Metric label="Actual Emission Intensity" value="0.89 tCO₂e/ton" />
          <Metric label="Target Year" value="2025–26" />
          <Metric label="Shortfall" value={<span className="text-rose-600 font-semibold">12,000 credits</span>} />
          <Metric label="Deadline" value="March 2026" />
          <div className="col-span-2 md:col-span-3 space-y-2">
            <div className="text-sm text-muted-foreground">AI Compliance Forecast</div>
            <div className="text-sm">
              At current operations, you will exceed 2026 target by 1.2%. Purchase 8,400 credits or reduce output by 3%.
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Actions</h3>
          <div className="flex flex-col gap-2">
            <Button>Buy Required Credits</Button>
            <Button variant="outline">Generate Compliance Report</Button>
          </div>
          <div className="pt-2">
            <Badge>Indian CCTS</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}