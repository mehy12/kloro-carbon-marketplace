"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp, ShieldCheck, AlertTriangle, Leaf, Factory } from "lucide-react";
import { useEffect, useState } from "react";

type BuyerProfile = {
  calculatedCarbonFootprint: string;
  recommendedCredits: number;
  industry: string;
  companyName: string;
  employeeCount: number;
};

export default function OverviewView() {
  const [buyerData, setBuyerData] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        console.log('API /api/me response:', data); // Debug log
        if (data.buyerProfile) {
          console.log('Buyer profile data:', data.buyerProfile); // Debug log
          setBuyerData(data.buyerProfile);
        } else {
          console.log('No buyer profile found in response'); // Debug log
        }
      } catch (error) {
        console.error('Failed to fetch buyer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBuyerData();
  }, []);
  
  const carbonFootprint = buyerData?.calculatedCarbonFootprint ? parseFloat(buyerData.calculatedCarbonFootprint) : 0;
  const recommendedCredits = buyerData?.recommendedCredits || 0;
  
  // Debug logging
  console.log('Carbon footprint calculation:', {
    buyerData,
    calculatedCarbonFootprint: buyerData?.calculatedCarbonFootprint,
    carbonFootprint,
    recommendedCredits
  });
  
  const compliant = true; // You can add logic here based on actual compliance status
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Carbon Footprint Summary Card */}
      {buyerData && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <Factory className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-900">Your Carbon Footprint Assessment</h3>
                <p className="text-sm text-emerald-700">
                  Based on your {buyerData.industry} business with {buyerData.employeeCount} employees
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-900">
                  {carbonFootprint.toLocaleString()} tCO₂e
                </div>
                <div className="text-sm text-emerald-700">Annual emissions</div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-white border border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-900">Recommended Credits</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-900">
                    {recommendedCredits.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600">credits needed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Calculated Footprint" 
          value={`${carbonFootprint.toLocaleString()} tCO₂e`} 
          trend={buyerData?.industry || "Industry-based"} 
        />
        <StatCard 
          title="Recommended Credits" 
          value={recommendedCredits.toLocaleString()} 
          trend="110% coverage" 
          trendUp 
        />
        <StatCard title="Owned Credits" value="0" trend="Start buying credits" />
        <StatCard title="Retired Credits" value="0" trend="Offset your impact" />
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
            <h3 className="font-semibold">AI Recommendations</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Based on your {carbonFootprint.toLocaleString()} tCO₂e footprint, you need {recommendedCredits.toLocaleString()} credits annually.
              </p>
              <p className="text-sm font-medium text-emerald-700">
                • Prioritize verified nature-based solutions<br/>
                • Consider forestry and renewable energy credits<br/>
                • Start with {Math.ceil(recommendedCredits * 0.25).toLocaleString()} credits this quarter
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Buy Credits</Button>
              <Button variant="outline" size="sm">View Market</Button>
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