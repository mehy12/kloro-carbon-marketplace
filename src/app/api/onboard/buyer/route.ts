import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { buyerProfile, user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateCarbonFootprintWithAI } from "@/lib/ollama";

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

  // Narrow and coerce inputs
  const companyName = typeof body?.companyName === "string" ? body.companyName : null;
  const industryType = typeof body?.industryType === "string" ? body.industryType : "other";
  const address = typeof body?.address === "string" ? body.address : null;

  const employeeCount =
    typeof body?.employeeCount === "number" && Number.isFinite(body.employeeCount)
      ? Math.max(0, Math.floor(body.employeeCount))
      : 1;

  const annualRevenue =
    typeof body?.annualRevenue === "number" && Number.isFinite(body.annualRevenue)
      ? body.annualRevenue
      : 0;

  const energyConsumption =
    typeof body?.energyConsumption === "number" && Number.isFinite(body.energyConsumption)
      ? body.energyConsumption
      : 0;

  const businessTravelDistance =
    typeof body?.businessTravelDistance === "number" && Number.isFinite(body.businessTravelDistance)
      ? body.businessTravelDistance
      : 0;

  try {
    // Use AI to calculate footprint
    const aiCalculationResult = await calculateCarbonFootprintWithAI({
      employeeCount,
      annualRevenue,
      industryType,
      energyConsumption,
      businessTravelDistance,
    });

    const calculatedFootprint =
      typeof aiCalculationResult?.totalFootprint === "number"
        ? aiCalculationResult.totalFootprint
        : Number(aiCalculationResult?.totalFootprint ?? 0);

    const recommendedCredits =
      typeof aiCalculationResult?.recommendedCredits === "number"
        ? aiCalculationResult.recommendedCredits
        : Number(aiCalculationResult?.recommendedCredits ?? 0);

    // Persist buyer profile (1:1 using user id as profile id)
    await db.insert(buyerProfile).values({
      id: session.user.id,
      userId: session.user.id,
      companyName: companyName,
      industry: industryType ?? null,
      address: address ?? null,
      employeeCount,
      annualRevenue: String(annualRevenue),
      energyConsumption: String(energyConsumption),
      businessTravelDistance: String(businessTravelDistance),
      calculatedCarbonFootprint: String(calculatedFootprint),
      recommendedCredits,
    });

    // Update user role to buyer
    await db.update(userTable).set({ role: "buyer" }).where(eq(userTable.id, session.user.id));

    return NextResponse.json({
      ok: true,
      carbonFootprint: calculatedFootprint,
      recommendedCredits,
      breakdown: aiCalculationResult?.breakdown ?? null,
      insights: aiCalculationResult?.insights ?? null,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}
