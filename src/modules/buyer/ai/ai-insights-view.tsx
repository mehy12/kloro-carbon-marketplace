"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function AIInsightsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Emission Projection</h3>
          <p className="text-sm text-muted-foreground">Next 12 months forecast shows gradual decline in intensity with current initiatives.</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Optimal Credit Mix</h3>
          <p className="text-sm text-muted-foreground">60% renewable, 40% forestry for lowest cost per tCO₂e given your profile.</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold">Price Prediction</h3>
          <p className="text-sm text-muted-foreground">+5% forecast for forestry credits next quarter; renewables stable.</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <h3 className="font-semibold">Risk Alerts</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mt-2">
            <li>500 credits expiring in 60 days.</li>
            <li>One batch under verification; settlement ETA 5 days.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}