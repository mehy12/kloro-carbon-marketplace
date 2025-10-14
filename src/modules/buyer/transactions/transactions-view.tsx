"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BlockchainBadge } from "@/components/ui/blockchain-badge";
import { RefreshCw, Download } from "lucide-react";
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
  // Blockchain fields
  blockchainTxHash?: string | null;
  registry?: string | null;
}

export default function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTransactions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const res = await fetch("/api/transactions");
      const data = await res.json();
      
      if (res.ok) {
        setTransactions(data.transactions || []);
        setUserRole(data.userRole || "");
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

  const filteredTransactions = transactions.filter(txn => {
    if (dateFilter && !txn.date.includes(dateFilter)) return false;
    if (typeFilter && txn.type !== typeFilter) return false;
    if (statusFilter && txn.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
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
    <div className="flex flex-col gap-4">
      {/* Header with refresh and last updated info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{userRole === "buyer" ? "Purchase" : "Sales"} Transactions</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filter by date"
          />
          <Select value={typeFilter || undefined} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
            <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="retire">Retire</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
            <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setDateFilter("");
                setTypeFilter("");
                setStatusFilter("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blockchain</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Certificate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {transactions.length === 0 ? "No transactions found" : "No transactions match the current filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">
                      <Badge variant="outline" className="capitalize">
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{txn.projectName}</div>
                        <div className="text-xs text-muted-foreground">{txn.projectType}</div>
                      </div>
                    </TableCell>
                    <TableCell>{txn.quantity.toLocaleString()}</TableCell>
                    <TableCell>${txn.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>${txn.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(txn.status)}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <BlockchainBadge 
                        blockchainTxHash={txn.blockchainTxHash}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>{txn.counterparty}</TableCell>
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
                          {downloadingCert === txn.id ? "Generating..." : "Certificate"}
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

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Transactions</div>
                <div className="text-2xl font-bold">{filteredTransactions.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Credits</div>
                <div className="text-2xl font-bold">
                  {filteredTransactions.reduce((sum, txn) => sum + txn.quantity, 0).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold">
                  ${filteredTransactions.reduce((sum, txn) => sum + txn.totalValue, 0).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredTransactions.filter(txn => txn.status === "completed").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Actions */}
      <div className="flex gap-2">
        <Button variant="outline">Export CSV</Button>
        <Button variant="outline">Export PDF</Button>
        <Button variant="outline">Generate Report</Button>
      </div>
    </div>
  );
}
