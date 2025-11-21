import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project, sellerProfile } from "@/db/schema";
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
type SafeSession = { user?: SessionUser | null } | null;

type SellerRow = {
  id: string;
  userId: string;
  // ...add other seller fields if you rely on them
};

export async function GET() {
  try {
    const rawHdrs = await headers();
    const hdrs = new Headers(Object.fromEntries(rawHdrs.entries()));
    const sessionRaw = await auth.api.getSession({ headers: hdrs });
    const session = sessionRaw as SafeSession;

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find seller profile for this user
    const sp = (await db
      .select()
      .from(sellerProfile)
      .where(eq(sellerProfile.userId, session.user.id))
      .limit(1)) as SellerRow[];

    if (sp.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    const seller = sp[0];

    const items = (await db.select().from(project).where(eq(project.sellerId, seller.id))) as unknown[];

    return NextResponse.json({ projects: items });
  } catch (e: unknown) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}

