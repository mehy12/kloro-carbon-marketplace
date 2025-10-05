import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { buyerProfile, carbonCredit, project, sellerProfile, transaction } from "@/db/schema";
import { z } from "zod";

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

    // Update available quantity (simple non-transactional update for demo)
    await db
      .update(carbonCredit)
      .set({ availableQuantity: (available - qty) as any })
      .where(eq(carbonCredit.id, credit.id as any));

    const total = (Number(credit.pricePerCredit) || 0) * qty;
    const id = crypto.randomUUID();

    await db.insert(transaction).values({
      id: id as any,
      buyerId: buyer.id as any,
      sellerId: proj.sellerId as any,
      creditId: credit.id as any,
      quantity: qty as any,
      totalPrice: String(total) as any,
      status: 'completed' as any,
    });

    return NextResponse.json({ ok: true, transactionId: id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
