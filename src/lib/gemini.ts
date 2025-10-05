import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY not found in environment variables');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface CarbonCalculationData {
  employeeCount: number;
  annualRevenue: number;
  industryType: string;
  energyConsumption: number;
  businessTravelDistance: number;
}

export interface CarbonCalculationResult {
  totalFootprint: number;
  breakdown: {
    employeeBasedEmissions: number;
    energyEmissions: number;
    travelEmissions: number;
    industryMultiplier: number;
  };
  recommendedCredits: number;
  insights: string[];
}

export async function calculateCarbonFootprintWithAI(data: CarbonCalculationData): Promise<CarbonCalculationResult> {
  // Fallback calculation (original logic) if Gemini is not available
  const fallbackCalculation = (): CarbonCalculationResult => {
    const industryMultipliers: Record<string, number> = {
      'manufacturing': 12.5,
      'energy': 15.2,
      'construction': 8.7,
      'transportation': 11.3,
      'technology': 4.2,
      'finance': 3.8,
      'healthcare': 6.5,
      'retail': 5.1,
      'other': 6.0
    };
    
    const multiplier = industryMultipliers[data.industryType] || 6.0;
    let totalFootprint = data.employeeCount * multiplier;
    
    const energyEmissions = (data.energyConsumption * 0.5) / 1000;
    const travelEmissions = (data.businessTravelDistance * 0.2) / 1000;
    
    totalFootprint += energyEmissions + travelEmissions;
    
    if (data.annualRevenue > 1000000) {
      const revenueScaling = Math.log10(data.annualRevenue / 1000000) * 0.1 + 1;
      totalFootprint *= revenueScaling;
    }
    
    return {
      totalFootprint: Math.round(totalFootprint * 100) / 100,
      breakdown: {
        employeeBasedEmissions: data.employeeCount * multiplier,
        energyEmissions,
        travelEmissions,
        industryMultiplier: multiplier
      },
      recommendedCredits: Math.ceil(totalFootprint * 1.1),
      insights: [
        `Your ${data.industryType} business has a baseline of ${multiplier} tCO2e per employee`,
        'Consider energy efficiency improvements to reduce your footprint',
        'Nature-based carbon credits are recommended for your industry'
      ]
    };
  };

  // If Gemini is not available, use fallback
  if (!genAI) {
    return fallbackCalculation();
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Calculate the carbon footprint for a ${data.industryType} company with the following data:
    - Employees: ${data.employeeCount}
    - Annual Revenue: $${data.annualRevenue}
    - Energy Consumption: ${data.energyConsumption} kWh/year
    - Business Travel: ${data.businessTravelDistance} km/year
    
    Please provide:
    1. Total annual carbon footprint in tCO2e
    2. Breakdown by category (employee-based, energy, travel)
    3. Industry-specific multiplier used
    4. Recommended carbon credits needed (110% of footprint)
    5. 3 specific insights for this business type
    
    Use industry-standard emission factors and respond in JSON format:
    {
      "totalFootprint": number,
      "breakdown": {
        "employeeBasedEmissions": number,
        "energyEmissions": number,
        "travelEmissions": number,
        "industryMultiplier": number
      },
      "recommendedCredits": number,
      "insights": [string, string, string]
    }
    
    Base calculations on:
    - Manufacturing: 12.5 tCO2e/employee/year
    - Technology: 4.2 tCO2e/employee/year
    - Finance: 3.8 tCO2e/employee/year
    - Energy: 15.2 tCO2e/employee/year
    - Healthcare: 6.5 tCO2e/employee/year
    - Retail: 5.1 tCO2e/employee/year
    - Construction: 8.7 tCO2e/employee/year
    - Transportation: 11.3 tCO2e/employee/year
    - Grid electricity: 0.5 kg CO2e/kWh
    - Business travel: 0.2 kg CO2e/km
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiResult = JSON.parse(jsonMatch[0]);
      return aiResult as CarbonCalculationResult;
    }
    
    // If AI response can't be parsed, fall back to our calculation
    return fallbackCalculation();
    
  } catch (error) {
    console.error('Gemini AI calculation failed:', error);
    // Return fallback calculation
    return fallbackCalculation();
  }
}

export async function generateMarketInsights(): Promise<string[]> {
  if (!genAI) {
    return [
      'Carbon credit prices expected to rise 15-20% in Q2 2024',
      'Nature-based solutions seeing increased demand from corporate buyers',
      'New regulatory requirements driving market growth in renewable energy credits'
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Generate 5 current and relevant carbon credit market insights for January 2024. Focus on:
    1. Price trends and predictions
    2. Regulatory changes
    3. Technology developments
    4. Market opportunities
    5. Risk factors
    
    Make them specific, actionable, and realistic. Return as a JSON array of strings.
    Example format: ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback insights
    return [
      'Carbon credit prices expected to rise 15-20% in Q2 2024',
      'Nature-based solutions seeing increased demand from corporate buyers',
      'New regulatory requirements driving market growth in renewable energy credits',
      'Blockchain verification systems gaining adoption for credit tracking',
      'Direct air capture technologies entering commercial scale'
    ];
    
  } catch (error) {
    console.error('Gemini market insights failed:', error);
    return [
      'Carbon credit prices expected to rise 15-20% in Q2 2024',
      'Nature-based solutions seeing increased demand from corporate buyers',
      'New regulatory requirements driving market growth in renewable energy credits'
    ];
  }
}