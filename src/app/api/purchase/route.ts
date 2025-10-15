import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { buyerProfile, carbonCredit, project, sellerProfile, transaction } from "@/db/schema";
import { z } from "zod";
import { recordBlockchainTransaction, isBlockchainEnabled, DEFAULT_ADDRESSES, DEAD_ADDRESS, getBlockchainExplorerUrl } from "@/lib/blockchain";
import { isErc1155Configured, mint1155, baseSepoliaTxUrl } from "@/lib/web3/server";
import { isTenderlyConfigured, tenderlySimulateTx } from "@/lib/web3/tenderly";

const BodySchema = z.object({
  creditId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "buyer") {
      return NextResponse.json({ error: "Only buyers can make purchases" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Load buyer profile
    const buyers = await db
      .select()
      .from(buyerProfile)
      .where(eq(buyerProfile.userId, session.user.id as any))
      .limit(1);
    if (buyers.length === 0) {
      return NextResponse.json({ error: "Buyer profile not found" }, { status: 400 });
    }
    const buyer = buyers[0];

    // Load credit and project (to find seller)
    const credits = await db
      .select({
        id: carbonCredit.id,
        availableQuantity: carbonCredit.availableQuantity,
        pricePerCredit: carbonCredit.pricePerCredit,
        projectId: carbonCredit.projectId,
      })
      .from(carbonCredit)
      .where(eq(carbonCredit.id, parsed.data.creditId as any))
      .limit(1);

    if (credits.length === 0) return NextResponse.json({ error: "Credit not found" }, { status: 404 });
    const credit = credits[0] as any;

    const projs = await db
      .select({ id: project.id, sellerId: project.sellerId })
      .from(project)
      .where(eq(project.id, credit.projectId as any))
      .limit(1);

    if (projs.length === 0) return NextResponse.json({ error: "Project not found for credit" }, { status: 404 });
    const proj = projs[0];

    const qty = parsed.data.quantity;
    const available = Number(credit.availableQuantity || 0);
    if (qty > available) {
      return NextResponse.json({ error: "Insufficient available quantity" }, { status: 400 });
    }

    // Calculate total price
    const total = (Number(credit.pricePerCredit) || 0) * qty;
    const transactionId = crypto.randomUUID();
    
    // Generate certificate URL (placeholder for now)
    const certificateUrl = `https://kloro.app/certificates/${transactionId}`;
    
    let erc1155TxHash: string | null = null;
    let ledgerTxHash: string | null = null;

    // Try new ERC-1155 mint on Base Sepolia if configured
    if (isErc1155Configured()) {
      try {
        const buyerWallet = (json?.walletAddress as string | undefined)?.toLowerCase() as `0x${string}` | undefined;
        const to = (buyerWallet || DEAD_ADDRESS.toLowerCase()) as `0x${string}`;

        // Ensure credit has a tokenId; if not, derive deterministically from UUID and persist
        let tokenId: string | null = (credit as any).tokenId || null;
        if (!tokenId) {
          const hex = String(credit.id).replace(/-/g, "");
          // take first 32 hex chars as uint256 string
          tokenId = BigInt("0x" + hex.slice(0, 32)).toString();
          await db.update(carbonCredit).set({ tokenId: tokenId as any }).where(eq(carbonCredit.id, credit.id as any));
        }
        const hash = await mint1155(to, BigInt(tokenId), BigInt(qty));
        erc1155TxHash = hash as any;
      } catch (e: any) {
        console.error("⚠️ ERC-1155 mint failed:", e?.message || e);
      }
    }

    // Always record a transparent ledger event if configured
    if (isBlockchainEnabled()) {
      try {
        ledgerTxHash = await recordBlockchainTransaction({
          buyer: (json?.walletAddress || DEAD_ADDRESS) as string,
          seller: DEFAULT_ADDRESSES.SELLER_WALLET,
          credits: qty,
          projectId: proj.id,
          registry: "Verra VCS",
          certificateUrl,
          priceUsd: Math.round(total * 100),
        });
      } catch (e: any) {
        console.error("⚠️ Ledger record failed:", e?.message || e);
      }
    }

    // If we still don't have a link, simulate on Tenderly for a shareable URL
    let simulationUrl: string | null = null;
    if (!ledgerTxHash && !erc1155TxHash && isTenderlyConfigured()) {
      try {
        const from = (process.env.DEMO_FROM_ADDRESS || DEAD_ADDRESS) as `0x${string}`;
        const sim = await tenderlySimulateTx({ from, to: DEAD_ADDRESS as any, data: "0x", value: "0x0" });
        simulationUrl = sim.publicUrl || null;
      } catch (e: any) {
        console.error("⚠️ Tenderly simulation failed:", e?.message || e);
      }
    }

    // Fallback/compatibility: ledger-only record on Polygon if configured
    // legacy fallback removed in favor of explicit ledgerTxHash above
    
    // Update available quantity (simple non-transactional update for demo)
    await db
      .update(carbonCredit)
      .set({ availableQuantity: (available - qty) as any })
      .where(eq(carbonCredit.id, credit.id as any));

    // Insert transaction with blockchain data
    await db.insert(transaction).values({
      id: transactionId as any,
      buyerId: buyer.id as any,
      sellerId: proj.sellerId as any,
      creditId: credit.id as any,
      quantity: qty as any,
      totalPrice: total.toFixed(2) as any,
      status: 'completed' as any,
      // Blockchain fields
      blockchainTxHash: (ledgerTxHash || erc1155TxHash) as any,
      chainId: (erc1155TxHash ? 84532 : null) as any,
      walletAddress: (json?.walletAddress || DEAD_ADDRESS) as any,
      contractAddress: process.env.ERC1155_CONTRACT_ADDRESS as any,
      tokenId: (credit as any).tokenId as any,
      retiredOnChainAt: null as any,
      registry: "Verra VCS" as any,
      certificateUrl: certificateUrl as any,
      projectId: proj.id as any,
    });

    const ledgerExplorerUrl = ledgerTxHash ? getBlockchainExplorerUrl(ledgerTxHash) : null;
    const erc1155ExplorerUrl = erc1155TxHash ? baseSepoliaTxUrl(erc1155TxHash as any) : null;

    return NextResponse.json({ 
      ok: true, 
      transactionId,
      ledgerTxHash,
      erc1155TxHash,
      certificateUrl,
      explorerUrl: ledgerExplorerUrl || erc1155ExplorerUrl || simulationUrl,
      ledgerExplorerUrl,
      erc1155ExplorerUrl,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
