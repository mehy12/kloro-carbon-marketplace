"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BuyCreditsModal from "./components/buy-credits-modal";

const MOCK_CREDITS = [
  { id: "1", title: "Arunachal Forest Restoration Project", registry: "VCS", location: "India", type: "Nature-Based", vintage: 2024, available: 150000, price: 1250, co: ["SDG13", "SDG15"] },
  { id: "2", title: "Gujarat Solar Offset", registry: "Verra", location: "India", type: "Renewable", vintage: 2023, available: 90000, price: 980, co: ["SDG7"] },
  { id: "3", title: "Meghalaya Reforestation", registry: "Gold Standard", location: "India", type: "Nature-Based", vintage: 2024, available: 60000, price: 1320, co: ["SDG13", "SDG15"] },
];

export default function MarketView() {
  const [open, setOpen] = useState<string | null>(null);
  const [price, setPrice] = useState([150, 1500]);
  const [buyFor, setBuyFor] = useState<any | null>(null);

  return (
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

      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_CREDITS.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.title}</h3>
                <span className="text-xs text-muted-foreground">[Verified: {c.registry}]</span>
              </div>
              <div className="text-sm text-muted-foreground">Location: {c.location} | Type: {c.type} | Vintage: {c.vintage}</div>
              <div className="text-sm text-muted-foreground">Available: {c.available.toLocaleString()} | Price: ₹{c.price}/credit</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => setOpen(c.id)}>Details</Button>
                <Button size="sm" onClick={() => setBuyFor(c)}>Buy Credits</Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
  );
}
