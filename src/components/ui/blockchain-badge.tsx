"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockchainBadgeProps {
  blockchainTxHash?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  showExplorerLink?: boolean;
}

export function BlockchainBadge({
  blockchainTxHash,
  className,
  size = "md",
  showExplorerLink = true,
}: BlockchainBadgeProps) {
  const isVerified = !!blockchainTxHash;
  const explorerUrl = blockchainTxHash
    ? `https://mumbai.polygonscan.com/tx/${blockchainTxHash}`
    : null;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (isVerified) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge
          variant="secondary"
          className={cn(
            "bg-green-100 text-green-800 border-green-300",
            sizeClasses[size]
          )}
        >
          <ShieldCheck className={cn("mr-1", iconSizes[size])} />
          Blockchain Verified
        </Badge>

        {showExplorerLink && explorerUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-green-600 hover:text-green-800"
            onClick={() => window.open(explorerUrl, "_blank")}
            title="View on PolygonScan"
          >
            <ExternalLink className={iconSizes[size]} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-yellow-100 text-yellow-800 border-yellow-300",
        sizeClasses[size],
        className
      )}
    >
      <AlertTriangle className={cn("mr-1", iconSizes[size])} />
      Database Only
    </Badge>
  );
}

interface BlockchainStatusProps {
  blockchainTxHash?: string | null;
  transactionDate: string | Date;
  className?: string;
}

export function BlockchainStatus({
  blockchainTxHash,
  className,
}: BlockchainStatusProps) {
  const isVerified = !!blockchainTxHash;
  const explorerUrl = blockchainTxHash
    ? `https://mumbai.polygonscan.com/tx/${blockchainTxHash}`
    : null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Verification Status
        </span>
        <BlockchainBadge
          blockchainTxHash={blockchainTxHash}
          size="sm"
          showExplorerLink={false}
        />
      </div>

      {isVerified && blockchainTxHash && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-green-800">
              Blockchain Hash
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-green-600 hover:text-green-800"
              onClick={() => explorerUrl && window.open(explorerUrl, "_blank")}
              title="View on PolygonScan"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>

          <div className="font-mono text-xs text-green-700 break-all">
            {blockchainTxHash}
          </div>

          <div className="mt-2 text-xs text-green-600">
            Permanently recorded on Polygon Mumbai testnet
          </div>
        </div>
      )}

      {!isVerified && (
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="text-xs text-yellow-700">
            This transaction was recorded in our database but not on the blockchain.
            Blockchain recording may have been unavailable at the time of purchase.
          </div>
        </div>
      )}
    </div>
  );
}