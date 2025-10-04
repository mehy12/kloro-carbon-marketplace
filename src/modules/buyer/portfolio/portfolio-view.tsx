"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PortfolioView() {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="active">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Credits</TabsTrigger>
            <TabsTrigger value="retired">Retired Credits</TabsTrigger>
            <TabsTrigger value="pending">Pending / Reserved</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit ID</TableHead>
                    <TableHead>Source Project</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Registry</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <PortfolioRow id="CR-1001" project="Arunachal Forest Restoration" qty={4500} date="2024-08-10" registry="VCS" value="₹5.6M" />
                  <PortfolioRow id="CR-1002" project="Gujarat Solar Offset" qty={3200} date="2024-05-12" registry="Verra" value="₹3.1M" />
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retired" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credit ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Retired At</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>CR-0990</TableCell>
                    <TableCell>Meghalaya Reforestation</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>2025-10-05</TableCell>
                    <TableCell>Compliance FY 2025-26</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              No pending orders.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PortfolioRow({ id, project, qty, date, registry, value }: { id: string; project: string; qty: number; date: string; registry: string; value: string }) {
  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{project}</TableCell>
      <TableCell>{qty.toLocaleString()}</TableCell>
      <TableCell>{date}</TableCell>
      <TableCell>{registry}</TableCell>
      <TableCell>{value}</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" className="mr-2">Retire</Button>
        <Button size="sm" variant="outline" className="mr-2">Sell</Button>
        <Button size="sm" variant="outline">Transfer</Button>
      </TableCell>
    </TableRow>
  );
}