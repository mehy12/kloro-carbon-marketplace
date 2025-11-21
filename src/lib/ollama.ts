/**
 * Ollama Local AI Integration
 * 
 * This module provides AI-powered features using locally-run Ollama models.
 * All functions gracefully fall back to rule-based logic if Ollama is unavailable.
 * 
 * Setup:
 * 1. Install Ollama: https://ollama.ai
 * 2. Pull a lightweight model: ollama pull phi3
 * 3. Start Ollama service: ollama serve (runs on localhost:11434)
 * 
 * Supported models: phi3, gemma2:2b, mistral, llama2
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3';

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

/**
 * Helper function to make requests to Ollama API
 */
async function queryOllama(prompt: string, timeout: number = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Ollama API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.message?.content || null;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.warn('Ollama request timed out');
    } else {
      console.warn('Ollama unavailable, using fallback logic:', (error as Error).message);
    }
    return null;
  }
}

/**
 * Calculate carbon footprint using Ollama AI or rule-based fallback
 */
export async function calculateCarbonFootprintWithAI(
  data: CarbonCalculationData
): Promise<CarbonCalculationResult> {
  // Rule-based fallback calculation
  const fallbackCalculation = (): CarbonCalculationResult => {
    const industryMultipliers: Record<string, number> = {
      manufacturing: 12.5,
      energy: 15.2,
      construction: 8.7,
      transportation: 11.3,
      technology: 4.2,
      finance: 3.8,
      healthcare: 6.5,
      retail: 5.1,
      other: 6.0,
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
        industryMultiplier: multiplier,
      },
      recommendedCredits: Math.ceil(totalFootprint * 1.1),
      insights: [
        `Your ${data.industryType} business has a baseline of ${multiplier} tCO2e per employee`,
        'Consider energy efficiency improvements to reduce your footprint',
        'Nature-based carbon credits are recommended for your industry',
      ],
    };
  };

  // Try Ollama first
  const prompt = `Calculate the carbon footprint for a ${data.industryType} company with the following data:
- Employees: ${data.employeeCount}
- Annual Revenue: $${data.annualRevenue}
- Energy Consumption: ${data.energyConsumption} kWh/year
- Business Travel: ${data.businessTravelDistance} km/year

Please provide a JSON response with:
1. Total annual carbon footprint in tCO2e
2. Breakdown by category (employee-based, energy, travel)
3. Industry-specific multiplier used
4. Recommended carbon credits needed (110% of footprint)
5. 3 specific insights for this business type

Use these industry-standard emission factors:
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

Respond ONLY with valid JSON in this exact format:
{
  "totalFootprint": number,
  "breakdown": {
    "employeeBasedEmissions": number,
    "energyEmissions": number,
    "travelEmissions": number,
    "industryMultiplier": number
  },
  "recommendedCredits": number,
  "insights": ["string", "string", "string"]
}`;

  const aiResponse = await queryOllama(prompt);

  if (aiResponse) {
    try {
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0]);
        // Validate the result has required fields
        if (
          aiResult.totalFootprint &&
          aiResult.breakdown &&
          aiResult.recommendedCredits &&
          aiResult.insights
        ) {
          return aiResult as CarbonCalculationResult;
        }
      }
    } catch (error) {
      console.warn('Failed to parse Ollama response:', error);
    }
  }

  // Fall back to rule-based calculation
  return fallbackCalculation();
}

/**
 * Generate market insights using Ollama AI or predefined fallback
 */
export async function generateMarketInsights(): Promise<string[]> {
  const fallbackInsights = [
    'Carbon credit prices expected to rise 15-20% in Q2 2024',
    'Nature-based solutions seeing increased demand from corporate buyers',
    'New regulatory requirements driving market growth in renewable energy credits',
    'Blockchain verification systems gaining adoption for credit tracking',
    'Direct air capture technologies entering commercial scale',
  ];

  const prompt = `Generate 5 current and relevant carbon credit market insights for 2024. Focus on:
1. Price trends and predictions
2. Regulatory changes
3. Technology developments
4. Market opportunities
5. Risk factors

Make them specific, actionable, and realistic. Respond ONLY with a JSON array of strings.
Example format: ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]`;

  const aiResponse = await queryOllama(prompt);

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        if (Array.isArray(insights) && insights.length > 0) {
          return insights;
        }
      }
    } catch (error) {
      console.warn('Failed to parse market insights:', error);
    }
  }

  return fallbackInsights;
}

/**
 * Classify product into sustainability categories (rule-based, no AI needed)
 */
export function classifyProduct(productName: string, description: string): string {
  const text = `${productName} ${description}`.toLowerCase();

  if (
    text.includes('carbon credit') ||
    text.includes('carbon offset') ||
    text.includes('verified')
  ) {
    return 'Verified Carbon Offset';
  }

  if (
    text.includes('recycled') ||
    text.includes('reclaimed') ||
    text.includes('upcycled')
  ) {
    return 'Recycled Material';
  }

  if (
    text.includes('solar') ||
    text.includes('wind') ||
    text.includes('renewable') ||
    text.includes('clean energy')
  ) {
    return 'Renewable Energy Product';
  }

  return 'Sustainable Product';
}

/**
 * Summarize sustainability description (simple truncation, no AI needed)
 */
export function summarizeSustainability(description: string): string {
  if (!description || description.length <= 200) {
    return description;
  }

  // Split into sentences
  const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];

  // Take first 2-3 sentences that fit within ~200 chars
  let summary = '';
  for (const sentence of sentences) {
    if (summary.length + sentence.length <= 200) {
      summary += sentence;
    } else {
      break;
    }
  }

  // If no sentences fit, just truncate
  if (!summary) {
    summary = description.substring(0, 197) + '...';
  }

  return summary.trim();
}
