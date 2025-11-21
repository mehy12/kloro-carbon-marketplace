import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { carbonCredit, project, sellerProfile } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Utility: Extract a safe error message without using `any`
 */
function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Unknown error";
}

export async function GET() {
  try {
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch seller profile for authenticated user
    const seller = await db
      .select()
      .from(sellerProfile)
      .where(eq(sellerProfile.userId, session.user.id))
      .limit(1);

    if (seller.length === 0) {
      return NextResponse.json({ listings: [] });
    }

    const sellerId = seller[0].id;

    // Fetch carbon credits owned by this seller
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
      .where(eq(project.sellerId, sellerId));

    return NextResponse.json({ listings: rows });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
