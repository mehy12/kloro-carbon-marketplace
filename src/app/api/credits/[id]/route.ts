import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { carbonCredit, project, sellerProfile } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const patchSchema = z.object({
  pricePerCredit: z.number().positive().optional(),
  availableQuantity: z.number().int().nonnegative().optional(),
  status: z.enum(["available", "sold", "retired"]).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: "No changes provided" });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sp = await db.select().from(sellerProfile).where(eq(sellerProfile.userId, session.user.id as any)).limit(1);
    if (sp.length === 0) return NextResponse.json({ error: "Seller profile not found" }, { status: 400 });

    const owned = await db.select().from(carbonCredit)
      .leftJoin(project, eq(project.id, carbonCredit.projectId))
      .where(and(eq(carbonCredit.id, id as any), eq(project.sellerId, sp[0].id as any)))
      .limit(1);
    if (owned.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const updates: any = {};
    if (parsed.data.pricePerCredit !== undefined) updates.pricePerCredit = parsed.data.pricePerCredit as any;
    if (parsed.data.availableQuantity !== undefined) updates.availableQuantity = parsed.data.availableQuantity as any;
    if (parsed.data.status !== undefined) updates.status = parsed.data.status as any;

    await db.update(carbonCredit).set(updates).where(eq(carbonCredit.id, id as any));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}