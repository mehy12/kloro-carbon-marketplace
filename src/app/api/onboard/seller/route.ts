import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sellerProfile, user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ErrorWithMessage {
  message?: string;
}
function getErrorMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (typeof e === "object" && e !== null && "message" in e) {
    return (e as ErrorWithMessage).message ?? "Unknown error";
  }
  return "Unknown error";
}

type SessionUser = { id: string; role?: string } | null;
type SafeSession = { user?: SessionUser } | null;

export async function POST(req: NextRequest) {
  const hdrs = await headers();
  const sessionRaw = await auth.api.getSession({ headers: hdrs });
  const session = sessionRaw as SafeSession;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const firmName =
    typeof body?.firmName === "string" ? body.firmName : null;
  const website =
    typeof body?.website === "string" ? body.website : null;

  try {
    // Insert seller profile
    await db.insert(sellerProfile).values({
      id: session.user.id,        // no any
      userId: session.user.id,    // no any
      organizationName: firmName, // string | null
      website: website,           // string | null
    });

    // Update user role to seller
    await db
      .update(userTable)
      .set({ role: "seller" })
      .where(eq(userTable.id, session.user.id));

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(e) },
      { status: 500 }
    );
  }
}
