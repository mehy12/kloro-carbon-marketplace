import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { carbonCredit, project, sellerProfile } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sp = await db.select().from(sellerProfile).where(eq(sellerProfile.userId, session.user.id as any)).limit(1);
    if (sp.length === 0) return NextResponse.json({ listings: [] });

    const rows = await db
      .select({
        id: carbonCredit.id,
        projectId: carbonCredit.projectId,
        projectName: project.name,
        availableQuantity: carbonCredit.availableQuantity,
        pricePerCredit: carbonCredit.pricePerCredit,
        status: carbonCredit.status,
      })
      .from(carbonCredit)
      .leftJoin(project, eq(project.id, carbonCredit.projectId))
      .where(eq(project.sellerId, sp[0].id as any));

    return NextResponse.json({ listings: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}