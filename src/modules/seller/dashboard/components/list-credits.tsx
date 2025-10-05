"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const PROJECTS = [
  { id: "p1", name: "Arunachal Forest Restoration", tags: ["Verified", "Nature-Based"], batches: [
    { id: "b1", label: "Batch A (2024)", qty: 35000 },
    { id: "b2", label: "Batch B (2023)", qty: 20000 },
  ] },
  { id: "p2", name: "Gujarat Solar Offset", tags: ["Verified", "Renewable"], batches: [
    { id: "b3", label: "Batch A (2023)", qty: 15000 },
  ] },
];

function formatINR(n: number) { return n.toLocaleString("en-IN"); }
function formatCurrency(n: number) { return `₹${formatINR(Math.round(n))}`; }

export default function ListCredits() {
  const [projectId, setProjectId] = useState<string>(PROJECTS[0].id);
  const project = useMemo(() => PROJECTS.find(p => p.id === projectId) ?? PROJECTS[0], [projectId]);
  const [batchId, setBatchId] = useState<string>(project.batches[0].id);
  const batch = useMemo(() => project.batches.find(b => b.id === batchId) ?? project.batches[0], [project, batchId]);

  const [qty, setQty] = useState<number>(Math.min(10000, batch.qty));
  const [price, setPrice] = useState<number>(1250);
  const [platformRate, setPlatformRate] = useState<number>(0.02);

  const clampQty = (q: number) => {
    const max = batch.qty;
    if (!Number.isFinite(q) || q < 1) return 1;
    if (q > max) return max;
    return Math.floor(q);
  };

  const onQtyChange = (val: string) => {
    const n = Number(val.replace(/[^0-9]/g, ""));
    setQty((q) => clampQty(Number.isNaN(n) ? q : n));
  };

  const base = qty * price;
  const platformFee = base * platformRate;
  const expected = base - platformFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardContent className="p-4 space-y-4">
          <div className="font-semibold">List Credits</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Project</div>
              <Select value={projectId} onValueChange={(v) => { setProjectId(v); const p = PROJECTS.find(p => p.id===v)!; setBatchId(p.batches[0].id); }}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {PROJECTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Tags: {project.tags.join(", ")}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Batch</div>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {project.batches.map(b => <SelectItem key={b.id} value={b.id}>{b.label} ({formatINR(b.qty)} available)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Quantity</div>
              <Input inputMode="numeric" value={qty} onChange={(e)=>onQtyChange(e.target.value)} onBlur={()=>setQty((q)=>clampQty(q))} />
              <div className="text-xs text-muted-foreground">Max: {formatINR(batch.qty)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Price per credit</div>
              <Input inputMode="numeric" value={price} onChange={(e)=>setPrice(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Platform Commission</div>
              <div className="h-10 rounded border flex items-center px-3 bg-muted/20 text-sm">
                <div className="flex items-center gap-1">
                  <span>{Math.round(platformRate*100)}%</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center size-4 rounded-full bg-muted text-xs cursor-default">i</span>
                    </TooltipTrigger>
                    <TooltipContent>Platform fee deducted from your earnings</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Preview Listing</Button>
            <Button>Confirm & List</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">Summary</div>
          <div className="text-sm text-muted-foreground">You are listing {formatINR(qty)} credits at {formatCurrency(price)}/credit</div>
          <div className="rounded-md bg-muted/40 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Gross Amount</span><span>{formatCurrency(base)}</span></div>
            <div className="flex items-center justify-between"><span>Platform Fee ({Math.round(platformRate*100)}%)</span><span>-{formatCurrency(platformFee)}</span></div>
            <div className="border-t pt-2 flex items-center justify-between font-medium"><span>Expected Earnings</span><span>{formatCurrency(expected)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
