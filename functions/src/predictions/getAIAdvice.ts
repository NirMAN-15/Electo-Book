import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

export const getAIPrediction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { meterId, meterState, settings, alarms } = data;
  if (!meterId || !meterState) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required data");
  }

  const apiKey = functions.config().gemini?.key || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    functions.logger.warn("Gemini API key not configured. Returning fallback advice.");
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
    functions.logger.error("Error generating AI prediction", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to generate prediction");
  }
});
