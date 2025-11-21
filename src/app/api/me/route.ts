import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { buyerProfile, sellerProfile } from "@/db/schema";
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

type SessionUser = { id: string; role?: "buyer" | "seller" | string } | null;
type SafeSession = { user?: SessionUser | null } | null;

export async function GET() {
  const hdrs = await headers();
  const sessionRaw = await auth.api.getSession({ headers: hdrs });
  const session = sessionRaw as SafeSession;

  if (!session || !session.user) {
    return NextResponse.json({ user: null });
  }

  try {
    let buyerData: unknown = null;
    let sellerData: unknown = null;

    if (session.user.role === "buyer") {
      const buyerProfiles = await db
        .select()
        .from(buyerProfile)
        .where(eq(buyerProfile.userId, session.user.id))
        .limit(1);

      if (buyerProfiles.length > 0) {
        buyerData = buyerProfiles[0];
      }
    }

    if (session.user.role === "seller") {
      const sellerProfiles = await db
        .select()
        .from(sellerProfile)
        .where(eq(sellerProfile.userId, session.user.id))
        .limit(1);

      if (sellerProfiles.length > 0) {
        sellerData = sellerProfiles[0];
      }
    }

    return NextResponse.json({
      user: session.user,
      buyerProfile: buyerData,
      sellerProfile: sellerData,
    });
  } catch (error: unknown) {
    console.error("Error fetching profile data:", getErrorMessage(error));
    return NextResponse.json({ user: session.user });
  }
}
