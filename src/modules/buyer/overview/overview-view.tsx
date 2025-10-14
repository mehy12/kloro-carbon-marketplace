"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Leaf, Factory, ShoppingCart, PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import { CarbonFootprintBreakdown } from "@/components/ui/carbon-footprint-breakdown";

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
    <div className="flex flex-col gap-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Footprint" 
          value={`${carbonFootprint.toLocaleString()} tCO₂e`} 
          trend={buyerData?.industry || "Annual emissions"} 
          icon={Factory}
        />
        <StatCard 
          title="Recommended Credits" 
          value={recommendedCredits.toLocaleString()} 
          trend="110% coverage" 
          trendUp 
          icon={Leaf}
        />
        <StatCard 
          title="Owned Credits" 
          value="0" 
          trend="Start buying credits"
          icon={ShoppingCart}
        />
        <StatCard 
          title="Categories Analyzed" 
          value="6" 
          trend="From your reports"
          icon={PieChart}
        />
      </div>

      {/* Detailed Carbon Footprint Breakdown */}
      <CarbonFootprintBreakdown totalFootprint={carbonFootprint || 581} />

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Take Action</h3>
            <p className="text-sm text-muted-foreground">Offset your carbon footprint</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Buy Credits
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              View Market
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Track Progress
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Retire Credits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon }: { 
  title: string; 
  value: string; 
  trend?: string; 
  trendUp?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{title}</div>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
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
