import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";
import { GoogleGenAI } from "@google/genai";
import type { CallableRequest } from "firebase-functions/v2/https";

interface GetAIAdviceRequest {
  meterId: string;
  meterState: any;
  settings?: any;
  alarms?: any[];
}

export const getAIAdvice = onCall(
  { region: "asia-south1" },
  async (request: CallableRequest<GetAIAdviceRequest>) => {
    const context = request.auth;
    const data = request.data;

    if (!context) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { meterId, meterState, settings, alarms } = data;
    if (!meterId || !meterState) {
      throw new HttpsError("invalid-argument", "Missing required data");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn("Gemini API key not configured. Returning fallback advice.");
      return { advice: "API key not configured. Please ensure your electrical loads are balanced." };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
You are an expert Electrical Engineering AI Assistant for 'Electro Book' (a Sri Lankan Smart Energy Monitor).
Analyze the following live meter reading and system state.

METER READING:
- Current Power Draw: ${meterState.currentPower} kW
- Voltage: ${meterState.voltage} V
- Current: ${meterState.current} A
- Power Factor: ${meterState.powerFactor}
- Total Units Today: ${meterState.totalUnitsToday} kWh
- Accumulated Cost Today: LKR ${meterState.accumulatedCostToday}

SETTINGS:
- Target Budget: LKR ${settings?.targetBudget || 'N/A'}
- Phase: ${settings?.phase || 'Single Phase'}

ACTIVE ALARMS:
${alarms && alarms.length > 0 ? JSON.stringify(alarms) : 'None'}

INSTRUCTIONS:
1. Provide a brief, professional engineering analysis of the power factor and voltage.
2. If there are alarms, give immediate actionable steps.
3. Suggest 2-3 specific ways to reduce consumption based on the current load.
4. Format your response strictly in Markdown with headers, bullet points, and bold text. Keep it concise but highly valuable. Do NOT wrap the entire response in a markdown code block.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const advice = response.text || "No advice generated.";

      // Cache prediction
      await admin.database().ref(`/predictions/${meterId}/lastPrediction`).set({
        advice,
        generatedAt: admin.database.ServerValue.TIMESTAMP,
        model: 'gemini-2.5-flash'
      });

      return { advice };

    } catch (error: any) {
      logger.error("Error generating AI prediction", error);
      throw new HttpsError("internal", error.message || "Failed to generate prediction");
    }
  }
);
