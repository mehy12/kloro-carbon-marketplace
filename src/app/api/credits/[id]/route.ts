import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { carbonCredit, project, sellerProfile } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Zod validation input
const patchSchema = z
  .object({
    pricePerCredit: z.number().positive().optional(),
    availableQuantity: z.number().int().nonnegative().optional(),
    status: z.enum(["available", "sold", "retired"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No changes provided" });

// EXACT DB-backed update type
type UpdateFields = {
  pricePerCredit?: string; // decimal → string
  availableQuantity?: number;
  status?: "available" | "sold" | "retired";
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Auth session
    const hdrs = await headers();
    const session = await auth.api.getSession({ headers: hdrs });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate seller profile
    const sp = await db
      .select()
      .from(sellerProfile)
      .where(eq(sellerProfile.userId, session.user.id))
      .limit(1);

    if (sp.length === 0)
      return NextResponse.json({ error: "Seller profile not found" }, { status: 400 });

    // Ensure the seller owns this credit
    const owned = await db
      .select()
      .from(carbonCredit)
      .leftJoin(project, eq(project.id, carbonCredit.projectId))
      .where(and(eq(carbonCredit.id, id), eq(project.sellerId, sp[0].id)))
      .limit(1);

    if (owned.length === 0)
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    // Safe update object matching DB types
    const updates: Partial<UpdateFields> = {};

    if (parsed.data.pricePerCredit !== undefined) {
      updates.pricePerCredit = parsed.data.pricePerCredit.toString();
    }
    if (parsed.data.availableQuantity !== undefined) {
      updates.availableQuantity = parsed.data.availableQuantity;
    }
    if (parsed.data.status !== undefined) {
      updates.status = parsed.data.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid changes provided" }, { status: 400 });
    }

    // Type-safe update
    await db.update(carbonCredit).set(updates).where(eq(carbonCredit.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed" },
      { status: 500 }
    );
  }
}
