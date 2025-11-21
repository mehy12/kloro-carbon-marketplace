import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  transaction,
  buyerProfile,
  sellerProfile,
  carbonCredit,
  project,
  certificateRecord
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    // Get user's profile ID
    let userProfileId = null;
    if (userRole === "buyer") {
      const buyerData = await db
        .select({ id: buyerProfile.id })
        .from(buyerProfile)
        .where(eq(buyerProfile.userId, userId))
        .limit(1);
      userProfileId = buyerData[0]?.id;
    } else if (userRole === "seller") {
      const sellerData = await db
        .select({ id: sellerProfile.id })
        .from(sellerProfile)
        .where(eq(sellerProfile.userId, userId))
        .limit(1);
      userProfileId = sellerData[0]?.id;
    }

    if (!userProfileId) {
      return NextResponse.json({ transactions: [] });
    }

    // Build query based on user role
    let whereCondition;
    if (userRole === "buyer") {
      whereCondition = eq(transaction.buyerId, userProfileId);
    } else {
      whereCondition = eq(transaction.sellerId, userProfileId);
    }

    // Fetch transactions with related data
    const transactions = await db
      .select({
        transaction: transaction,
        buyer: buyerProfile,
        seller: sellerProfile,
        credit: carbonCredit,
        project: project,
        certificate: certificateRecord,
      })
      .from(transaction)
      .leftJoin(buyerProfile, eq(transaction.buyerId, buyerProfile.id))
      .leftJoin(sellerProfile, eq(transaction.sellerId, sellerProfile.id))
      .leftJoin(carbonCredit, eq(transaction.creditId, carbonCredit.id))
      .leftJoin(project, eq(carbonCredit.projectId, project.id))
      .leftJoin(certificateRecord, eq(certificateRecord.transactionId, transaction.id))
      .where(whereCondition)
      .orderBy(desc(transaction.transactionDate))
      .limit(50);

    // Format transactions for frontend
    const formattedTransactions = transactions.map(txn => ({
      id: txn.transaction.id,
      date: txn.transaction.transactionDate,
      type: userRole === "buyer" ? "buy" : "sell",
      quantity: txn.transaction.quantity,
      unitPrice: parseFloat(txn.transaction.totalPrice) / txn.transaction.quantity,
      totalValue: parseFloat(txn.transaction.totalPrice),
      status: txn.transaction.status,
      counterparty: userRole === "buyer"
        ? txn.seller?.organizationName || "Unknown Seller"
        : txn.buyer?.companyName || "Unknown Buyer",
      projectName: txn.project?.name || "N/A",
      projectType: txn.project?.type || "N/A",
      creditType: txn.project?.type || "Unknown",
      hasCertificate: !!txn.certificate,
      certificateId: txn.certificate?.certId || null,
      // Blockchain fields
      blockchainTxHash: txn.transaction.blockchainTxHash,
      registry: txn.transaction.registry,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      userRole,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error: unknown) {
    console.error("Transactions API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch transactions",
        details: message,
      },
      { status: 500 }
    );
  }

}