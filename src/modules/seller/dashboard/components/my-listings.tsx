"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MyListings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/credits/mine");
    const data = await res.json();
    setItems(data.listings ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSave = async (id: string, changes: { pricePerCredit?: number; availableQuantity?: number; status?: string }) => {
    const res = await fetch(`/api/credits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (res.ok) load();
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <div className="text-base font-semibold">My Listings</div>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Price/credit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">Loading…</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-sm text-muted-foreground">No listings yet</TableCell></TableRow>
            ) : (
              items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.projectName ?? l.projectId}</TableCell>
                  <TableCell>
                    <Input
                      inputMode="numeric"
                      defaultValue={Number(l.availableQuantity)}
                      onBlur={(e)=>{
                        const v = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
                        if (v !== Number(l.availableQuantity)) onSave(l.id, { availableQuantity: v });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      inputMode="numeric"
                      defaultValue={Number(l.pricePerCredit)}
                      onBlur={(e)=>{
                        const v = Number(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                        if (v !== Number(l.pricePerCredit)) onSave(l.id, { pricePerCredit: v });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={l.status} onValueChange={(v)=>onSave(l.id, { status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={()=>onSave(l.id, { status: l.status === "available" ? "retired" : "available" })}>
                      {l.status === "available" ? "Unlist" : "Relist"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}