import { NextResponse } from "next/server";
import { generateMarketInsights } from "@/lib/ollama";

export async function GET() {
  try {
    const insights = await generateMarketInsights();

    return NextResponse.json({
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating market insights:', error);

    // Fallback insights if Ollama fails
    const fallbackInsights = [
      'Carbon credit prices expected to rise 15-20% in Q2 2024',
      'Nature-based solutions seeing increased demand from corporate buyers',
      'New regulatory requirements driving market growth in renewable energy credits',
      'Blockchain verification systems gaining adoption for credit tracking',
      'Direct air capture technologies entering commercial scale'
    ];

    return NextResponse.json({
      insights: fallbackInsights,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
}