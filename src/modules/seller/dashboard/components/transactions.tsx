"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Download, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: string;
  counterparty: string;
  projectName: string;
  projectType: string;
  creditType: string;
  hasCertificate: boolean;
  certificateId: string | null;
}

export default function SellerTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchTransactions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const res = await fetch("/api/transactions");
      const data = await res.json();
      
      if (res.ok) {
        setTransactions(data.transactions || []);
        setLastUpdated(data.lastUpdated);
      } else {
        console.error("Failed to fetch transactions:", data.error);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadCertificate = async (transactionId: string) => {
    try {
      setDownloadingCert(transactionId);
      const res = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, copies: 1 }),
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        alert(j?.error ?? `Failed: ${res.status}`);
        return;
      }
      
      const blob = await res.blob();
      const filename = res.headers.get("Content-Disposition")?.split("filename=")?.[1]?.replace(/"/g, "") || `certificate_${transactionId}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      // Refresh transactions to update certificate status
      fetchTransactions();
    } catch (error) {
      console.error("Certificate download error:", error);
      alert("Failed to download certificate");
    } finally {
      setDownloadingCert(null);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = transactions.filter(t => t.status === "completed").reduce((sum, txn) => sum + txn.totalValue, 0);
  const totalCredits = transactions.filter(t => t.status === "completed").reduce((sum, txn) => sum + txn.quantity, 0);
  const pendingTransactions = transactions.filter(t => t.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Sold</p>
                <p className="text-2xl font-bold">{totalCredits.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">C</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingTransactions}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-yellow-600">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sales</CardTitle>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <Button 
              onClick={() => fetchTransactions(true)} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certificate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sales transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.slice(0, 10).map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{txn.projectName}</div>
                        <div className="text-xs text-muted-foreground">{txn.projectType}</div>
                      </div>
                    </TableCell>
                    <TableCell>{txn.counterparty}</TableCell>
                    <TableCell>{txn.quantity.toLocaleString()}</TableCell>
                    <TableCell>${txn.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">${txn.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(txn.status)}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {txn.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCertificate(txn.id)}
                          disabled={downloadingCert === txn.id}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          {downloadingCert === txn.id ? "Generating..." : "Download"}
                        </Button>
                      )}
                      {txn.hasCertificate && txn.certificateId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {txn.certificateId}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}