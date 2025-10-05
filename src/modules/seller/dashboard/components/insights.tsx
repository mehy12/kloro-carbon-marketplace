"use client";

import { Card, CardContent } from "@/components/ui/card";

const INSIGHTS = [
  {
    title: "Pricing Recommendation",
    body: "Forestry-based credits are trading 7% higher this quarter. Adjust your price to ₹1,320 for optimal yield.",
  },
  {
    title: "Demand Forecast",
    body: "Demand from automotive OEMs in EMEA expected to rise 12% next month. Consider listing an additional 15,000 credits.",
  },
  {
    title: "Best-Selling Types",
    body: "Renewable energy credits saw 18% faster conversions compared to industrial offsets this week.",
  },
];

export default function Insights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {INSIGHTS.map((i, idx) => (
        <Card key={idx}>
          <CardContent className="p-4">
            <div className="font-semibold mb-1">{i.title}</div>
            <div className="text-sm text-muted-foreground">{i.body}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
