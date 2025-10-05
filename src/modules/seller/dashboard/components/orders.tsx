"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ORDERS = [
  { id: "ORD-1001", buyer: "Acme Ltd.", qty: 2500, price: 1250, fees: 62500, status: "Completed", date: "2025-09-15" },
  { id: "ORD-1002", buyer: "GreenCo Pvt.", qty: 1000, price: 1320, fees: 26400, status: "Pending", date: "2025-10-02" },
  { id: "ORD-1003", buyer: "EcoWorks", qty: 5000, price: 1200, fees: 120000, status: "Completed", date: "2025-08-20" },
];

function formatINR(n: number) { return n.toLocaleString("en-IN"); }
function formatCurrency(n: number) { return `₹${formatINR(Math.round(n))}`; }

export default function Orders() {
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [open, setOpen] = useState<typeof ORDERS[number] | null>(null);

  const filtered = ORDERS.filter(o => (status === "all" || o.status === status) && (!from || o.date >= from) && (!to || o.date <= to));

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex flex-wrap items-center gap-2 justify-between">
          <div className="text-base font-semibold">Orders / Transactions</div>
          <div className="flex items-center gap-2">
            <Input type="date" className="h-9" value={from} onChange={(e)=>setFrom(e.target.value)} />
            <Input type="date" className="h-9" value={to} onChange={(e)=>setTo(e.target.value)} />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9">Export CSV</Button>
            <Button variant="outline" className="h-9">Export PDF</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Credits Sold</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>{o.buyer}</TableCell>
                <TableCell>{formatINR(o.qty)}</TableCell>
                <TableCell>{formatCurrency(o.price)}</TableCell>
                <TableCell>{formatCurrency(o.fees)}</TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={()=>setOpen(o)}>Details</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!open} onOpenChange={()=>setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {open && (
            <div className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Info label="Order ID" value={open.id} />
                <Info label="Buyer" value={`${open.buyer} (masked)`} />
                <Info label="Credits Sold" value={formatINR(open.qty)} />
                <Info label="Price per credit" value={formatCurrency(open.price)} />
                <Info label="Fees" value={formatCurrency(open.fees)} />
                <Info label="Status" value={open.status} />
                <Info label="Date" value={open.date} />
              </div>
              <div className="rounded-md border p-3">
                <div className="font-medium">Settlement Timeline</div>
                <div className="text-muted-foreground">T+2 days to seller bank after buyer confirmation.</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
