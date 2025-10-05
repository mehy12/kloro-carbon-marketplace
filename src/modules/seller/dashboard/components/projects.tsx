"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const MOCK_PROJECTS = [
  { id: "p1", name: "Arunachal Forest Restoration", type: "Nature-Based", vintage: 2024, verification: "VCS", issued: 150000, available: 90000, status: "Verified" },
  { id: "p2", name: "Gujarat Solar Offset", type: "Renewable", vintage: 2023, verification: "Verra", issued: 90000, available: 30000, status: "Verified" },
  { id: "p3", name: "Meghalaya Reforestation", type: "Nature-Based", vintage: 2024, verification: "Gold Standard", issued: 60000, available: 55000, status: "Under Review" },
];

export default function Projects() {
  const [selected, setSelected] = useState<typeof MOCK_PROJECTS[number] | null>(null);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="text-base font-semibold">Projects</div>
          <div className="flex gap-2">
            <Input placeholder="Search projects" className="h-9" />
            <Select>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Verification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="verra">Verra</SelectItem>
                <SelectItem value="vcs">VCS</SelectItem>
                <SelectItem value="gs">Gold Standard</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-9">Add Project</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vintage</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Credits Issued</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PROJECTS.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell>{p.vintage}</TableCell>
                <TableCell>{p.verification}</TableCell>
                <TableCell>{p.issued.toLocaleString()}</TableCell>
                <TableCell>{p.available.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded border ${p.status === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setSelected(p)}>Details</Button>
                    <Button size="sm" variant="outline">Upload Certificate</Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Unlist</span>
                      <Switch />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-muted-foreground">Type: {selected.type} • Vintage: {selected.vintage} • Verified: {selected.verification}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Info title="Credits Issued" value={selected.issued.toLocaleString()} />
                <Info title="Available for Sale" value={selected.available.toLocaleString()} />
                <Info title="Status" value={selected.status} />
              </div>
              <div className="space-y-2">
                <div className="font-medium">Description</div>
                <p className="text-muted-foreground">Location: India • Method: {selected.type}. MRV reports, methodology, and supporting documents can be uploaded and managed here.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="font-medium">Credit Batches</div>
                    <p className="text-muted-foreground text-sm">Add or edit batches with quantities and vintages.</p>
                    <Button size="sm" variant="outline">Add Batch</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="font-medium">Pricing</div>
                    <p className="text-muted-foreground text-sm">Configure ₹ per credit for listings.</p>
                    <div className="flex gap-2">
                      <Input placeholder="₹1250" />
                      <Button size="sm">Save</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}
