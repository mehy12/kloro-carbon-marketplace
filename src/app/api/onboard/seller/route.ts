import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sellerProfile, user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    firmName,
    website,
    organizationType,
    location,
    description,
  } = body ?? {};

  try {
    // Store additional data in a temporary way until we can update the schema
    const organizationDescription = description ? `Organization Type: ${organizationType || 'Not specified'}\nLocation: ${location || 'Not specified'}\nDescription: ${description}` : null;
    
    await db.insert(sellerProfile).values({
      id: session.user.id as any,
      userId: session.user.id as any,
      organizationName: (firmName ?? null) as any,
      website: (website ?? null) as any,
    });

    await db
      .update(userTable)
      .set({ role: "seller" as any })
      .where(eq(userTable.id, session.user.id as any));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
