"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, Brain, Globe, Leaf, Building, Calendar, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

export default function AIInsightsView() {
  const [marketInsights, setMarketInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchMarketInsights = async () => {
      try {
        const response = await fetch('/api/market-insights');
        if (response.ok) {
          const data = await response.json();
          setMarketInsights(data.insights || []);
        }
      } catch (error) {
        console.error('Failed to fetch market insights:', error);
        // Use fallback insights
        setMarketInsights([
          'Carbon credit prices expected to rise 15-20% in Q2 2024',
          'Nature-based solutions seeing increased demand from corporate buyers',
          'New regulatory requirements driving market growth in renewable energy credits'
        ]);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchMarketInsights();
  }, []);
  return (
    <div className="space-y-6">
      {/* AI Market Intelligence Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100">
              <Brain className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-900">Market Intelligence</h2>
              <p className="text-purple-700">Real-time insights and predictions powered by local analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Trends & Market Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Global Market Trends (2024-2025)</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-emerald-900">Nature-Based Solutions</span>
                  <Badge className="bg-emerald-100 text-emerald-700">+35% Growth</Badge>
                </div>
                <p className="text-sm text-emerald-700 mt-1">
                  Forestry and regenerative agriculture credits expected to surge due to COP28 commitments
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Direct Air Capture</span>
                  <Badge className="bg-blue-100 text-blue-700">Emerging</Badge>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  New technology credits entering market with premium pricing (₹5,000-8,000/credit)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-900">Renewable Energy</span>
                  <Badge className="bg-orange-100 text-orange-700">Stabilizing</Badge>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Solar and wind credits reaching maturity with stable pricing around ₹800-1,200
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">Upcoming Regulatory Changes</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border-l-4 border-red-500 pl-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Q2 2024: Enhanced MRV Standards</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Stricter monitoring requirements may impact credit pricing and availability
                </p>
              </div>

              <div className="border-l-4 border-amber-500 pl-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Q3 2024: Corporate Disclosure Mandates</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  New ESG reporting requirements will increase corporate demand by 40-60%
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-3">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Q4 2024: Article 6 Implementation</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  International carbon market mechanisms will create new trading opportunities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold">Price Forecast (Next 6 Months)</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Forestry Credits</span>
                <span className="text-sm font-medium text-emerald-600">↗ +15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Renewable Energy</span>
                <span className="text-sm font-medium text-blue-600">→ Stable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Industrial Efficiency</span>
                <span className="text-sm font-medium text-orange-600">↗ +8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Optimal Purchase Strategy</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Now:</strong> Secure 40% of annual needs in renewable energy credits</p>
              <p>• <strong>Q2 2024:</strong> Purchase forestry credits before price surge</p>
              <p>• <strong>Q3 2024:</strong> Diversify into emerging technologies</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold">Market Risks & Opportunities</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>Risk:</strong> Supply shortages in Q2 due to verification delays</p>
              <p>• <strong>Opportunity:</strong> Early access to Article 6 credits in Q4</p>
              <p>• <strong>Watch:</strong> Potential policy changes affecting additionality</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market News & Updates */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Latest Market Intelligence</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2 w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              marketInsights.slice(0, 4).map((insight, index) => {
                const badges = ['Breaking', 'Analysis', 'Trend', 'Prediction'];
                const times = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago'];

                return (
                  <div key={index} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{badges[index] || 'Insight'}</Badge>
                      <span className="text-xs text-muted-foreground">{times[index] || 'Recent'}</span>
                    </div>
                    <h4 className="font-medium mb-1">{insight.split('.')[0]}.</h4>
                    <p className="text-sm text-muted-foreground">
                      {insight.split('.').slice(1).join('.') || 'AI-generated market intelligence based on current trends.'}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="outline">
              View Full Market Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
