"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEPS = [
  { key: "submitted", label: "Project Submitted", done: true },
  { key: "validation", label: "Under Validation", done: true },
  { key: "verified", label: "Verified", done: false },
  { key: "issued", label: "Credits Issued", done: false },
];

export default function Verification() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardContent className="p-4 space-y-4">
          <div className="font-semibold">Verification Pipeline</div>
          <div className="flex items-center gap-4">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`size-6 rounded-full border flex items-center justify-center text-xs ${s.done ? "bg-emerald-600 text-white border-emerald-600" : "bg-muted text-foreground/60"}`}>{i+1}</div>
                <div className="text-sm">{s.label}</div>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="font-medium">Verification Body</div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verra">Verra</SelectItem>
                    <SelectItem value="gold">Gold Standard</SelectItem>
                    <SelectItem value="bee">BEE India</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-fit">Submit for Review</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="font-medium">Upload MRV Documents</div>
                <Input type="file" />
                <Button variant="outline" className="w-fit">Upload</Button>
                <div className="text-xs text-muted-foreground">Accepts PDF, DOCX. Max 10MB.</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="font-medium">Audit & Renewal</div>
              <div className="text-sm text-muted-foreground">Next external audit due: 2026-03-01 • Renewal window opens: 2026-01-15</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-semibold">Compliance Status</div>
          <StatusRow label="Registry Linked" status="Yes" />
          <StatusRow label="Tax Compliance" status="Up to date" />
          <StatusRow label="MRV Docs" status="2 pending" />
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{status}</span>
    </div>
  );
}
