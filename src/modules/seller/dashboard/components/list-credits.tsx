"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

function formatINR(n: number) { return n.toLocaleString("en-IN"); }
function formatCurrency(n: number) { return `₹${formatINR(Math.round(n))}`; }

type Project = {
  id: string;
  name: string;
  type: string | null;
  registry: string | null;
};

export default function ListCredits() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data.projects ?? []);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load");
        setLoading(false);
      }
    };
    run();
  }, []);

  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    if (projects.length && !projectId) setProjectId(projects[0].id);
  }, [projects, projectId]);
  const project = useMemo(() => projects.find(p => p.id === projectId) ?? null, [projects, projectId]);

  const [qty, setQty] = useState<number>(1000);
  const [price, setPrice] = useState<number>(1250);
  const [platformRate] = useState<number>(0.02);

  const clampQty = (q: number) => {
    if (!Number.isFinite(q) || q < 1) return 1;
    return Math.floor(q);
  };

  const onQtyChange = (val: string) => {
    const n = Number(val.replace(/[^0-9]/g, ""));
    setQty((q) => clampQty(Number.isNaN(n) ? q : n));
  };

  const onList = async () => {
    if (!projectId) return;
    const res = await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, quantity: qty, pricePerCredit: price }),
    });
    if (res.ok) {
      router.refresh?.();
    }
  };

  const base = qty * price;
  const platformFee = base * platformRate;
  const expected = base - platformFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardContent className="p-4 space-y-4">
          <div className="font-semibold">List Credits</div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading projects…</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects found. Add a project first.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Project</div>
                  <Select value={projectId ?? undefined} onValueChange={setProjectId}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {project && (
                    <div className="text-xs text-muted-foreground">{[project.registry, project.type].filter(Boolean).join(" • ")}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quantity</div>
                  <Input inputMode="numeric" value={qty} onChange={(e)=>onQtyChange(e.target.value)} onBlur={()=>setQty((q)=>clampQty(q))} />
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
                <Button onClick={onList}>Confirm & List</Button>
              </div>
            </>
          )}
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
