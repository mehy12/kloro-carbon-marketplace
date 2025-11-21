"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Shield, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TransactionSuccessProps {
  transactionId: string;
  blockchainTxHash?: string | null;
  credits: number;
  totalPrice: number;
  certificateUrl?: string;
  explorerUrl?: string | null;
  onDownloadCertificate?: () => void;
  onClose?: () => void;
}

export function TransactionSuccess({
  transactionId,
  blockchainTxHash,
  credits,
  totalPrice,
  explorerUrl,
  onDownloadCertificate,
  onClose,
}: TransactionSuccessProps) {
  const setCopied = useState<string | null>(null)[1];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md mx-auto text-center bg-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              {blockchainTxHash && (
                <div className="absolute -top-2 -right-2">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase Successful!
          </h2>
          <p className="text-gray-600 text-sm">
            Your carbon credit purchase has been completed and recorded.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Credits Purchased:</span>
              <span className="font-semibold text-gray-900">{credits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction ID:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-gray-900">
                  {transactionId.slice(0, 8)}...
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => copyToClipboard(transactionId, "Transaction ID")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Blockchain Verification */}
          {blockchainTxHash ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Blockchain Verified
                </Badge>
              </div>

              <p className="text-sm text-green-700 mb-3">
                This transaction has been permanently recorded on the Polygon blockchain.
              </p>

              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-green-600">Blockchain Hash:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-green-800">
                    {blockchainTxHash.slice(0, 10)}...{blockchainTxHash.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => copyToClipboard(blockchainTxHash, "Blockchain Hash")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {explorerUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => window.open(explorerUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verify on PolygonScan
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Database Recorded
                </Badge>
              </div>
              <p className="text-sm text-yellow-700">
                Transaction recorded in our database. Blockchain recording unavailable.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            {onDownloadCertificate && (
              <Button
                onClick={onDownloadCertificate}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Download Certificate
              </Button>
            )}

            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Continue Shopping
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            Your certificate will be available in your dashboard within a few minutes.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
