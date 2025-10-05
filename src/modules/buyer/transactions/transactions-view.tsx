"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export default function TransactionsView() {
  const [txnId, setTxnId] = useState<string>("t1"); // demo default from seed
  const [copies, setCopies] = useState<number>(1);
  const [downloading, setDownloading] = useState(false);

  async function downloadCertificate() {
    try {
      setDownloading(true);
      const res = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txnId, copies }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        alert(j?.error ?? `Failed: ${res.status}`);
        return;
      }
      const blob = await res.blob();
      const isZip = res.headers.get("Content-Type")?.includes("zip");
      const filename = res.headers.get("Content-Disposition")?.split("filename=")?.[1]?.replace(/"/g, "") || (isZip ? `certificates_${txnId}.zip` : `certificate_${txnId}.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input type="date" />
          <Select>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="retire">Retire</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button className="flex-1">Apply</Button>
            <Button variant="outline" className="flex-1">Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual certificate generation (demo) */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <div className="text-sm font-medium mb-1">Transaction ID</div>
            <Input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="e.g., t1" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Copies</div>
            <Input inputMode="numeric" value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button onClick={downloadCertificate} disabled={downloading}>
              {downloading ? "Generating..." : "Download Certificate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Counterparty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>TXN-02398</TableCell>
                <TableCell>2025-10-03</TableCell>
                <TableCell>Buy</TableCell>
                <TableCell>1,000</TableCell>
                <TableCell>₹1,200</TableCell>
                <TableCell>₹1.2M</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Verra-India Forests</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TXN-02400</TableCell>
                <TableCell>2025-10-05</TableCell>
                <TableCell>Retire</TableCell>
                <TableCell>500</TableCell>
                <TableCell>–</TableCell>
                <TableCell>–</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell>–</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button>Export CSV</Button>
        <Button variant="outline">Export PDF</Button>
        <Button variant="outline">Audit Report</Button>
      </div>
    </div>
  );
}
