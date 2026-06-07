"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIAdvice = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
const genai_1 = require("@google/genai");
exports.getAIAdvice = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const context = request.auth;
    const data = request.data;
    if (!context) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { meterId, meterState, settings, alarms } = data;
    if (!meterId || !meterState) {
        throw new https_1.HttpsError("invalid-argument", "Missing required data");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        v2_1.logger.warn("Gemini API key not configured. Returning fallback advice.");
        return { advice: "API key not configured. Please ensure your electrical loads are balanced." };
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
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
    }
    catch (error) {
        v2_1.logger.error("Error generating AI prediction", error);
        throw new https_1.HttpsError("internal", error.message || "Failed to generate prediction");
    }
});
//# sourceMappingURL=getAIAdvice.js.map