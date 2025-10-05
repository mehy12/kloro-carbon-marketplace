import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { buyerProfile, sellerProfile } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    // Fetch buyer profile if user is a buyer
    let buyerData = null;
    let sellerData = null;

    if (session.user.role === 'buyer') {
      const buyerProfiles = await db.select()
        .from(buyerProfile)
        .where(eq(buyerProfile.userId, session.user.id as any))
        .limit(1);
      
      if (buyerProfiles.length > 0) {
        buyerData = buyerProfiles[0];
      }
    }

    if (session.user.role === 'seller') {
      const sellerProfiles = await db.select()
        .from(sellerProfile)
        .where(eq(sellerProfile.userId, session.user.id as any))
        .limit(1);
      
      if (sellerProfiles.length > 0) {
        sellerData = sellerProfiles[0];
      }
    }

    return NextResponse.json({ 
      user: session.user,
      buyerProfile: buyerData,
      sellerProfile: sellerData
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return NextResponse.json({ user: session.user });
  }
}
