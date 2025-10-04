"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TransactionsView() {
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