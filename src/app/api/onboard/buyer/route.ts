import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { buyerProfile, user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateCarbonFootprintWithAI } from "@/lib/gemini";

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
    employeeCount,
    annualRevenue,
    energyConsumption,
    businessTravelDistance,
  } = body ?? {};

  // Use Gemini AI for enhanced carbon footprint calculation
  const aiCalculationResult = await calculateCarbonFootprintWithAI({
    employeeCount: employeeCount || 1,
    annualRevenue: annualRevenue || 0,
    industryType: industryType || 'other',
    energyConsumption: energyConsumption || 0,
    businessTravelDistance: businessTravelDistance || 0
  });
  
  const calculatedFootprint = aiCalculationResult.totalFootprint;
  const recommendedCredits = aiCalculationResult.recommendedCredits;

  try {
    // Insert buyer_profile for this user (1:1 using user id as profile id)
    await db.insert(buyerProfile).values({
      id: session.user.id as any,
      userId: session.user.id as any,
      companyName: companyName as any,
      industry: (industryType ?? null) as any,
      address: (address ?? null) as any,
      employeeCount: employeeCount as any,
      annualRevenue: annualRevenue?.toString() as any,
      energyConsumption: energyConsumption?.toString() as any,
      businessTravelDistance: businessTravelDistance?.toString() as any,
      calculatedCarbonFootprint: calculatedFootprint.toString() as any,
      recommendedCredits: recommendedCredits as any,
    });

    // Update role to buyer (onboardingCompleted removed per new schema)
    await db
      .update(userTable)
      .set({ role: "buyer" as any })
      .where(eq(userTable.id, session.user.id as any));

    return NextResponse.json({ 
      ok: true, 
      carbonFootprint: calculatedFootprint,
      recommendedCredits: recommendedCredits,
      breakdown: aiCalculationResult.breakdown,
      insights: aiCalculationResult.insights
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
