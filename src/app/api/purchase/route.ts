import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { buyerProfile, carbonCredit, project, transaction } from "@/db/schema";
import { z } from "zod";
import {
  recordBlockchainTransaction,
  isBlockchainEnabled,
  DEFAULT_ADDRESSES,
  DEAD_ADDRESS,
  getBlockchainExplorerUrl,
} from "@/lib/blockchain";
import { isErc1155Configured, mint1155, baseSepoliaTxUrl } from "@/lib/web3/server";
import { isTenderlyConfigured, tenderlySimulateTx } from "@/lib/web3/tenderly";

const BodySchema = z.object({
  creditId: z.string().min(1),
  quantity: z.number().int().positive(),
  walletAddress: z.string().optional(),
});

interface ErrorWithMessage {
  message?: string;
}

function getErrorMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (typeof e === "object" && e !== null && "message" in e) {
    return (e as ErrorWithMessage).message ?? "Unknown error";
  }
  return "Unknown error";
}

type SessionUser = { id: string; role?: "buyer" | "seller"; onboardingCompleted?: boolean };
type SafeSession = { user?: SessionUser | null } | null;

type BuyerRow = {
  id: string;
  userId: string;
  // add other fields you need
};

type CreditRow = {
  id: string;
  availableQuantity: number | bigint | null;
  pricePerCredit: number | string | null;
  projectId: string;
  tokenId?: string | null;
};

type ProjectRow = {
  id: string;
  sellerId: string;
};

export async function POST(req: NextRequest) {
  try {
    const hdrs = await headers();
    const sessionRaw = await auth.api.getSession({ headers: hdrs });
    const session = sessionRaw as SafeSession;

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "buyer") {
      return NextResponse.json({ error: "Only buyers can make purchases" }, { status: 403 });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { creditId, quantity } = parsed.data;

    // Load buyer profile
    const buyers = await db
      .select()
      .from(buyerProfile)
      .where(eq(buyerProfile.userId, session.user.id))
      .limit(1);

    if (buyers.length === 0) {
      return NextResponse.json({ error: "Buyer profile not found" }, { status: 400 });
    }
    const buyer = buyers[0] as BuyerRow;

    // Load credit
    const credits = await db
      .select({
        id: carbonCredit.id,
        availableQuantity: carbonCredit.availableQuantity,
        pricePerCredit: carbonCredit.pricePerCredit,
        projectId: carbonCredit.projectId,
        tokenId: carbonCredit.tokenId,
      })
      .from(carbonCredit)
      .where(eq(carbonCredit.id, creditId))
      .limit(1);

    if (credits.length === 0) {
      return NextResponse.json({ error: "Credit not found" }, { status: 404 });
    }
    const credit = credits[0] as CreditRow;

    // Load project
    const projs = await db
      .select({ id: project.id, sellerId: project.sellerId })
      .from(project)
      .where(eq(project.id, credit.projectId))
      .limit(1);

    if (projs.length === 0) {
      return NextResponse.json({ error: "Project not found for credit" }, { status: 404 });
    }
    const proj = projs[0] as ProjectRow;

    const qty = quantity;
    const available = Number(credit.availableQuantity ?? 0);
    if (qty > available) {
      return NextResponse.json({ error: "Insufficient available quantity" }, { status: 400 });
    }

    // Calculate total price
    const pricePerCreditNumber = Number(credit.pricePerCredit ?? 0);
    const total = pricePerCreditNumber * qty;
    const transactionId = crypto.randomUUID();

    // Generate certificate URL (placeholder for now)
    const certificateUrl = `https://kloro.app/certificates/${transactionId}`;

    let erc1155TxHash: string | null = null;
    let ledgerTxHash: string | null = null;

    // Normalize optional wallet address from request JSON
    const walletAddressFromRequest =
      parsed.data && typeof (parsed.data as { walletAddress?: unknown }).walletAddress === "string"
        ? ((parsed.data as { walletAddress?: string }).walletAddress || undefined)
        : undefined;

    // Try new ERC-1155 mint on Base Sepolia if configured
    if (isErc1155Configured()) {
      try {
        const buyerWallet = walletAddressFromRequest ? walletAddressFromRequest.toLowerCase() : undefined;
        const to = (buyerWallet ?? DEAD_ADDRESS.toLowerCase()) as `0x${string}`;

        // Ensure credit has a tokenId; if not, derive deterministically from UUID-like id and persist
        let tokenId: string | null = credit.tokenId ?? null;
        if (!tokenId) {
          // derive deterministic numeric id from UUID-like string
          const hex = String(credit.id).replace(/-/g, "");
          const sliced = hex.slice(0, 32).padEnd(32, "0");
          // BigInt can handle the conversion; toString produces decimal
          tokenId = BigInt("0x" + sliced).toString();

          // persist tokenId back to DB (best-effort)
          await db.update(carbonCredit).set({ tokenId }).where(eq(carbonCredit.id, credit.id));
        }

        // mint1155 expects BigInt token id and BigInt quantity
        const txHash = await mint1155(to, BigInt(tokenId), BigInt(qty));
        if (typeof txHash === "string") {
          erc1155TxHash = txHash;
        }
      } catch (e: unknown) {
        console.error("⚠️ ERC-1155 mint failed:", getErrorMessage(e));
      }
    }

    // Always record a transparent ledger event if configured
    if (isBlockchainEnabled()) {
      try {
        ledgerTxHash = await recordBlockchainTransaction({
          buyer: (walletAddressFromRequest ?? DEAD_ADDRESS) as string,
          seller: DEFAULT_ADDRESSES.SELLER_WALLET,
          credits: qty,
          projectId: proj.id,
          registry: "Verra VCS",
          certificateUrl,
          priceUsd: Math.round(total * 100),
        });
      } catch (e: unknown) {
        console.error("⚠️ Ledger record failed:", getErrorMessage(e));
      }
    }

    // If we still don't have a link, simulate on Tenderly for a shareable URL
    let simulationUrl: string | null = null;
    if (!ledgerTxHash && !erc1155TxHash && isTenderlyConfigured()) {
      try {
        const from = (process.env.DEMO_FROM_ADDRESS ?? DEAD_ADDRESS) as `0x${string}`;
        const sim = await tenderlySimulateTx({ from, to: DEAD_ADDRESS, data: "0x", value: "0x0" });
        simulationUrl = sim.publicUrl ?? null;
      } catch (e: unknown) {
        console.error("⚠️ Tenderly simulation failed:", getErrorMessage(e));
      }
    }

    // Update available quantity (simple non-transactional update for demo)
    const newAvailable = Math.max(0, available - qty);
    await db.update(carbonCredit).set({ availableQuantity: newAvailable }).where(eq(carbonCredit.id, credit.id));

    // Insert transaction with blockchain data
    await db.insert(transaction).values({
      id: transactionId,
      buyerId: buyer.id,
      sellerId: proj.sellerId,
      creditId: credit.id,
      quantity: qty,
      totalPrice: total.toFixed(2),
      status: "completed",
      // Blockchain fields
      blockchainTxHash: ledgerTxHash ?? erc1155TxHash ?? null,
      chainId: erc1155TxHash ? 84532 : null,
      walletAddress: walletAddressFromRequest ?? DEAD_ADDRESS,
      contractAddress: process.env.ERC1155_CONTRACT_ADDRESS ?? null,
      tokenId: credit.tokenId ?? null,
      retiredOnChainAt: null,
      registry: "Verra VCS",
      certificateUrl,
      projectId: proj.id,
    });

    const ledgerExplorerUrl = ledgerTxHash ? getBlockchainExplorerUrl(ledgerTxHash) : null;
    const erc1155ExplorerUrl = erc1155TxHash ? baseSepoliaTxUrl(erc1155TxHash as `0x${string}`) : null;

    return NextResponse.json({
      ok: true,
      transactionId,
      ledgerTxHash,
      erc1155TxHash,
      certificateUrl,
      explorerUrl: ledgerExplorerUrl ?? erc1155ExplorerUrl ?? simulationUrl,
      ledgerExplorerUrl,
      erc1155ExplorerUrl,
    });
  } catch (e: unknown) {
    console.error("❌ Purchase route failed:", getErrorMessage(e));
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}
