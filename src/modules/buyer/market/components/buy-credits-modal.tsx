"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";

// Types for the project and seller
type Project = {
  id: string; // carbonCredit.id
  title: string;
  registry: string; // e.g., Verra, Gold Standard, VCS
  type?: string;
  vintage?: number;
  available?: number; // fallback available if seller not selected yet
  price?: number; // fallback price if seller not selected yet
};

type Seller = {
  id: string;
  name: string;
  pricePerCredit: number;
  available: number;
  platformFeeRate?: number; // e.g., 0.02
  complianceFeeRate?: number; // e.g., 0.01
};

function formatINR(n: number) {
  return n.toLocaleString("en-IN");
}

function formatCurrency(n: number) {
  return `₹${formatINR(Math.round(n))}`;
}

export default function BuyCreditsModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}) {
  const { address } = useAccount();

  // Mock sellers for this project (could be fetched based on project.id)
  const sellers: Seller[] = useMemo(
    () => [
      {
        id: "s1",
        name: "GreenOffset Pvt. Ltd.",
        pricePerCredit: project?.price ?? 1250,
        available: project?.available ?? 150000,
        platformFeeRate: 0.02,
        complianceFeeRate: 0.01,
      },
      {
        id: "s2",
        name: "CarbonXchange India",
        pricePerCredit: 1220,
        available: Math.max(1000, Math.round((project?.available ?? 100000) * 0.6)),
        platformFeeRate: 0.02,
        complianceFeeRate: 0.01,
      },
      {
        id: "s3",
        name: "EcoMarket Global",
        pricePerCredit: 1245,
        available: Math.max(1000, Math.round((project?.available ?? 100000) * 0.4)),
        platformFeeRate: 0.02,
        complianceFeeRate: 0.01,
      },
    ],
    [project]
  );

  const [sellerId, setSellerId] = useState<string>(sellers[0]?.id ?? "s1");
  const selectedSeller = sellers.find((s) => s.id === sellerId) ?? sellers[0];

  const [qty, setQty] = useState<number>(100);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const clampQty = (q: number) => {
    const max = selectedSeller?.available ?? 0;
    if (!Number.isFinite(q) || q < 1) return 1;
    if (q > max) return max;
    return Math.floor(q);
  };

  const onQtyChange = (val: string) => {
    const n = Number(val.replace(/[^0-9]/g, ""));
    setQty((q) => clampQty(Number.isNaN(n) ? q : n));
  };

  // Fee rates
  const platformRate = selectedSeller?.platformFeeRate ?? 0.02;
  const complianceRate = selectedSeller?.complianceFeeRate ?? 0.01;
  const gstRate = 0.18; // GST applied on platform + compliance fees

  // Calculations
  const pricePer = selectedSeller?.pricePerCredit ?? project?.price ?? 0;
  const base = qty * pricePer;
  const platformFee = base * platformRate;
  const complianceFee = base * complianceRate;
  const gst = (platformFee + complianceFee) * gstRate;
  const total = base + platformFee + complianceFee + gst;

  async function onConfirmPurchase() {
    if (!project) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditId: project.id, quantity: qty, walletAddress: address })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert(data?.error ?? 'Purchase failed');
        return;
      }
      setTransactionId(data.transactionId);
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadCertificate() {
    if (!transactionId) return;
    try {
      setDownloading(true);
      const res = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        alert(j?.error ?? `Failed: ${res.status}`);
        return;
      }
      const blob = await res.blob();
      const isZip = res.headers.get('Content-Type')?.includes('zip');
      const filename = res.headers.get('Content-Disposition')?.split('filename=')?.[1]?.replace(/"/g, '') || (isZip ? `certificates_${transactionId}.zip` : `certificate_${transactionId}.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">{step === 'form' ? 'Buy Credits' : 'Payment Successful'}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
        {step === 'form' ? (
          <>
          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-base font-semibold">{project.title}</div>
              <div className="text-sm text-muted-foreground">
                Type: {project.type ?? "—"} • Vintage: {project.vintage ?? "—"} • Verified: {project.registry}
              </div>
            </div>
            <div className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified: {project.registry}
            </div>
          </div>

          {/* Seller Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Seller</div>
              <Select value={sellerId} onValueChange={setSellerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({formatCurrency(s.pricePerCredit)}/credit)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                Available: {formatINR(selectedSeller?.available ?? 0)} credits
              </div>
            </div>

            {/* Compare Sellers */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Compare</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">Compare Sellers</Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[320px]">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Other Options</div>
                    <div className="divide-y border rounded">
                      {sellers.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSellerId(s.id)}
                          className={`w-full text-left px-3 py-2 hover:bg-accent ${s.id === sellerId ? "bg-accent/50" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm">{s.name}</div>
                            <div className="text-sm font-medium">{formatCurrency(s.pricePerCredit)}/credit</div>
                          </div>
                          <div className="text-xs text-muted-foreground">Available: {formatINR(s.available)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Quantity</div>
              <Input
                inputMode="numeric"
                value={qty}
                onChange={(e) => onQtyChange(e.target.value)}
                onBlur={() => setQty((q) => clampQty(q))}
              />
              <div className="text-xs text-muted-foreground">Max: {formatINR(selectedSeller?.available ?? 0)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Price per credit</div>
              <div className="h-10 rounded border flex items-center px-3 bg-muted/20">
                <span className="text-sm">{formatCurrency(pricePer)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Estimated Delivery</div>
              <div className="h-10 rounded border flex items-center px-3 bg-muted/20 text-sm text-muted-foreground">
                1–2 business days
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-base font-semibold">Grand Total</div>
              <div className="text-xl font-bold text-foreground">{formatCurrency(total)}</div>
            </div>

            <div className="bg-muted/40 rounded-md p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Base Price</span>
                <span className="text-right">
                  {formatCurrency(base)}
                  <span className="text-xs text-muted-foreground"> ({formatCurrency(pricePer)} × {formatINR(qty)})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span>Platform Fee ({Math.round(platformRate * 100)}%)</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center size-4 rounded-full bg-muted text-xs cursor-default">i</span>
                    </TooltipTrigger>
                    <TooltipContent>Supports platform operations and escrow</TooltipContent>
                  </Tooltip>
                </div>
                <span>{formatCurrency(platformFee)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span>Regulatory/Compliance Fee ({Math.round(complianceRate * 100)}%)</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center size-4 rounded-full bg-muted text-xs cursor-default">i</span>
                    </TooltipTrigger>
                    <TooltipContent>Verification, registry, and compliance handling</TooltipContent>
                  </Tooltip>
                </div>
                <span>{formatCurrency(complianceFee)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span>Tax (GST 18%)</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center size-4 rounded-full bg-muted text-xs cursor-default">i</span>
                    </TooltipTrigger>
                    <TooltipContent>Applied on fees as per policy</TooltipContent>
                  </Tooltip>
                </div>
                <span>{formatCurrency(gst)}</span>
              </div>

              <div className="border-t pt-2 flex items-center justify-between font-medium">
                <span>Total Payable</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button className="font-semibold" onClick={onConfirmPurchase} disabled={submitting}>
              {submitting ? 'Processing…' : 'Confirm Purchase'}
            </Button>
          </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 text-emerald-600">
              <CheckCircle className="h-16 w-16 animate-in fade-in zoom-in" />
            </div>
            <div className="text-lg font-semibold">Payment Successful</div>
            <div className="text-sm text-muted-foreground mt-1">Your transaction is completed.</div>
            {transactionId && (
              <div className="mt-4 text-xs text-muted-foreground">Transaction ID: <span className="font-mono">{transactionId}</span></div>
            )}
            <div className="mt-6 flex gap-3">
              <Button onClick={downloadCertificate} disabled={downloading || !transactionId}>
                {downloading ? 'Preparing…' : 'Download Certificate'}
              </Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
