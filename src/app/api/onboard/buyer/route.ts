import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { buyerProfile, user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    companyName,
    industryType,
    address,
  } = body ?? {};

  try {
    // Insert buyer_profile for this user (1:1 using user id as profile id)
    await db.insert(buyerProfile).values({
      id: session.user.id as any,
      userId: session.user.id as any,
      companyName: companyName as any,
      industry: (industryType ?? null) as any,
      address: (address ?? null) as any,
    });

    // Update role to buyer (onboardingCompleted removed per new schema)
    await db
      .update(userTable)
      .set({ role: "buyer" as any })
      .where(eq(userTable.id, session.user.id as any));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
