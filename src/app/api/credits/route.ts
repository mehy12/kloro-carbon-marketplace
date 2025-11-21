import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { carbonCredit, project, sellerProfile } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const createCreditSchema = z.object({
  projectId: z.string().min(1),
  quantity: z.number().int().positive(),
  pricePerCredit: z.number().positive(),
});

export async function GET() {
  try {
    // Public endpoint: list available credits for buyer marketplace
    const rows = await db
      .select({
        id: carbonCredit.id,
        availableQuantity: carbonCredit.availableQuantity,
        pricePerCredit: carbonCredit.pricePerCredit,
        projectId: carbonCredit.projectId,
        projectName: project.name,
        type: project.type,
        registry: project.registry,
        location: project.location,
        vintageYear: project.vintageYear,
      })
      .from(carbonCredit)
      .leftJoin(project, eq(project.id, carbonCredit.projectId))
      .where(eq(carbonCredit.status, 'available'));

    return NextResponse.json({ credits: rows });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createCreditSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure that the project belongs to the seller
    const sp = await db.select().from(sellerProfile).where(eq(sellerProfile.userId, session.user.id)).limit(1);
    if (sp.length === 0) return NextResponse.json({ error: "Seller profile not found" }, { status: 400 });

    const owned = await db.select().from(project)
      .where(and(eq(project.id, parsed.data.projectId), eq(project.sellerId, sp[0].id)))
      .limit(1);
    if (owned.length === 0) return NextResponse.json({ error: "Project not found or not owned by seller" }, { status: 404 });

    const id = crypto.randomUUID();
    await db.insert(carbonCredit).values({
      id: id,
      projectId: parsed.data.projectId,
      quantity: parsed.data.quantity,
      availableQuantity: parsed.data.quantity,
      pricePerCredit: parsed.data.pricePerCredit.toString(),
    });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });
  }
}
