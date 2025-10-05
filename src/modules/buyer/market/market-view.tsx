"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import BuyCreditsModal from "./components/buy-credits-modal";

type Credit = {
  id: string;
  projectName: string | null;
  registry: string | null;
  location: string | null;
  type: string | null;
  vintageYear: number | null;
  availableQuantity: number;
  pricePerCredit: string | number;
};

export default function MarketView() {
  const [open, setOpen] = useState<string | null>(null);
  const [price, setPrice] = useState([150, 1500]);
  const [buyFor, setBuyFor] = useState<any | null>(null);
  const [items, setItems] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await fetch("/api/credits");
      const data = await res.json();
      setItems(data.credits ?? []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load credits:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      load(false); // Don't show loading spinner for auto-refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [load]);

  // AI-based reliability scoring
  const calculateReliabilityScore = (credit: Credit) => {
    let score = 2; // Base score
    
    // Registry bonus
    if (credit.registry === 'Gold Standard') score += 2;
    else if (credit.registry === 'Verra') score += 1.5;
    else if (credit.registry) score += 0.5;
    
    // Project type bonus (nature-based solutions are generally more reliable)
    if (credit.type?.toLowerCase().includes('forest')) score += 1;
    if (credit.type?.toLowerCase().includes('renewable')) score += 0.5;
    
    // Vintage bonus (newer credits are generally more reliable)
    if (credit.vintageYear && credit.vintageYear >= 2022) score += 0.5;
    
    // Price reasonableness (too cheap might be suspicious)
    const price = Number(credit.pricePerCredit);
    if (price >= 500 && price <= 2000) score += 0.5;
    
    return Math.min(Math.floor(score), 5); // Cap at 5
  };

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carbon Credit Marketplace</h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => load(false)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="lg:col-span-1 h-fit">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Filters</h3>
          <Select>
            <SelectTrigger><SelectValue placeholder="Credit Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="renewable">Renewable</SelectItem>
              <SelectItem value="forestry">Forestry</SelectItem>
              <SelectItem value="waste">Waste</SelectItem>
              <SelectItem value="soil">Soil</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="apac">APAC</SelectItem>
              <SelectItem value="emea">EMEA</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Registry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="verra">Verra</SelectItem>
              <SelectItem value="gold">Gold Standard</SelectItem>
              <SelectItem value="bee">BEE</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Vintage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Price Range (₹/t)</div>
            <Slider min={0} max={2000} step={10} value={price} onValueChange={setPrice} />
            <div className="text-xs text-muted-foreground">₹{price[0]} - ₹{price[1]}</div>
          </div>
          <Input placeholder="Search projects" />
          <Button className="w-full">Apply</Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-4">
        {/* AI Recommendations Section */}
        {!loading && items.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded bg-blue-100">
                  <span className="text-blue-700 text-sm font-medium">AI</span>
                </div>
                <h3 className="font-semibold text-blue-900">Recommended for You</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-blue-800">
                  <strong>Top Picks:</strong> Based on your industry and requirements, we recommend:
                </p>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• <strong>Verified Sellers:</strong> Prioritize Gold Standard and Verra certified projects</div>
                  <div>• <strong>Nature-Based:</strong> Forestry projects offer co-benefits and reliability</div>
                  <div>• <strong>Price Range:</strong> ₹800-1,200/credit offers good value with quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading credits…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No credits available right now.</div>
          ) : (
            items.map((c, index) => {
              // AI-based seller ranking logic
              const isRecommended = (c.registry && ['Gold Standard', 'Verra'].includes(c.registry)) ||
                                   (c.type && ['forestry', 'reforestation'].includes(c.type?.toLowerCase())) ||
                                   (Number(c.pricePerCredit) >= 800 && Number(c.pricePerCredit) <= 1200);
              
              const reliabilityScore = calculateReliabilityScore(c);
              
              return (
                <Card key={c.id} className={`flex flex-col ${isRecommended ? 'border-emerald-200 bg-emerald-50/20' : ''}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{c.projectName ?? "Untitled Project"}</h3>
                        {isRecommended && (
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            AI Pick
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">[Verified: {c.registry ?? "—"}]</span>
                    </div>
                    
                    {/* AI Reliability Indicator */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${
                            i < reliabilityScore ? 'bg-emerald-500' : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Reliability Score</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">Location: {c.location ?? "—"} | Type: {c.type ?? "—"} | Vintage: {c.vintageYear ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">Available: {Number(c.availableQuantity ?? 0).toLocaleString()} | Price: ₹{Number(c.pricePerCredit)}/credit</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setOpen(c.id)}>Details</Button>
                      <Button size="sm" onClick={() => setBuyFor({ id: c.id, title: c.projectName, registry: c.registry, location: c.location, type: c.type, vintage: c.vintageYear, available: Number(c.availableQuantity), price: Number(c.pricePerCredit) })}>Buy Credits</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Verification documents, methodology, MRV reports, and carbon sequestration graphs would appear here.</p>
            <p>AI Recommendations: Arunachal Forest (High co-benefit), Gujarat Solar (Low price), Meghalaya Reforestation (Gold Standard).</p>
          </div>
        </DialogContent>
      </Dialog>

      <BuyCreditsModal open={!!buyFor} onClose={() => setBuyFor(null)} project={buyFor} />
      </div>
    </div>
  );
}
