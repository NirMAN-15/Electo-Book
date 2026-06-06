import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Google GenAI SDK initialized successfully.");
} else {
  console.warn("GEMINI_API_KEY environment variable is missing. AI advisor features will fallback to rule-based advice.");
}

// API: Energy conservation forecast and smart advisor
app.post("/api/predict", async (req, res) => {
  try {
    const { state, settings, alarms, tariffRate, targetBudget } = req.body;

    if (!ai) {
      // Rule-based fallback if Gemini API is not configured
      return res.json({
        success: true,
        advice: `### ⚡ Fallback Energy Advisory (No Gemini Key Detected)
Your Electro Book is reading real-time metrics. Here is your rule-based saving checklist:

1. **Power Factor Optimization (PF: ${state.powerFactor || 'N/A'}):**
   ${state.powerFactor < 0.85 
     ? "⚠️ Your Power Factor is below 0.85. Consider installing capacitor banks to avoid Reactive Power surcharges on your utility bill." 
     : "✅ Your Power Factor is healthy, maintaining high load efficiency."}
     
2. **Current Voltage (V: ${state.voltage || 'N/A'}V):**
   ${state.voltage < 215 ? "⚠️ Low voltage detected. Switch off inductive loads (motors/compressors) to avoid drawing excess current." : ""}
   ${state.voltage > 245 ? "⚠️ High voltage detected. Protect sensitive electronics with spike suppressors." : "✅ Normal voltage levels maintained."}

3. **Monthly Spending Estimates (₹${state.monthlyEstimatedCost || 'N/A'}):**
   ${state.monthlyEstimatedCost > (targetBudget || 5000) 
     ? `⚠️ Your monthly estimate of **₹${state.monthlyEstimatedCost}** exceeds your budget of **₹${targetBudget}**. We recommend turning off heavy heating, ventilating, and cooling loads during peak hours (6 PM - 10 PM) to minimize energy blocks.` 
     : "🎉 Terrific! Your forecasted bill is within your predefined monthly budget limit."}

4. **Alerts Log:**
   Currently tracking ${alarms?.length || 0} event registers. Keep thresholds updated to isolate appliances during ground leakage or over-current spikes.`
      });
    }

    // Build the AI prompt
    const prompt = `
You are the "Electro Book AI Smart Metering Advisor". Analyze the current grid statistics and customer settings below to provide structural, practical, and highly specific energy conservation advice, a monthly cost forecast brief, and any immediate caution recommendations based on electrical laws.

### Live Consumer Profile & Readings:
- **Voltage:** ${state.voltage} V (Ideal Sri Lankan/Indian standards are 230V-240V).
- **Current Load:** ${state.current} A
- **Power Factor (PF):** ${state.powerFactor} (Ideal is closer to 1.0; low PF means high reactive current draw).
- **Current Active Demand:** ${state.currentPower} kW
- **Today's Cumulative Usage:** ${state.totalUnitsToday} kWh (Units).
- **Accumulated Today's Cost:** ₹${state.accumulatedCostToday} (Based on ₹${tariffRate || 4.5} flat tariff rate/kWh).
- **Ongoing Month Projection:** Forecasted to use ${state.monthlyEstimatedUnits} units costing approx. ₹${state.monthlyEstimatedCost} overall.
- **Consumer Budget Limit:** ₹${targetBudget} per month.
- **Triggered Warnings/Alerts:** ${alarms && alarms.length > 0 ? alarms.map((a: any) => `[${a.type.toUpperCase()}] ${a.message} (Value: ${a.value})`).join(", ") : "No active critical alarm events."}

### Tasks:
1. Provide a quick diagnosis of their power quality (Current, Voltage stability, and particularly the Power Factor). Explain in plain, helpful language what their Power Factor means.
2. Cross-reference their monthly estimated bill (₹${state.monthlyEstimatedCost}) against their target budget (₹${targetBudget}). Outline how much they are over or under, and calculate concrete savings targets.
3. Suggest 3 to 4 actionable, localized lifestyle adjustments or appliance control measures (e.g., HVAC scheduling, lighting retrofits, or unplugging phantom loads) to bring down their usage.
4. Format the output back in beautiful Markdown. Avoid dry robotic preambles and make it encouraging, structured, and easy for any homeowner to read.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert electrical engineer and green energy home consultant. Provide rich, professional advice utilizing high quality Markdown formatting with bullet points and bold headers.",
      }
    });

    res.json({
      success: true,
      advice: response.text || "No response received from the Gemini AI Advisor. Please try again."
    });

  } catch (error: any) {
    console.error("Gemini API Error in server.ts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to connect to AI Advisor. " + error.message
    });
  }
});

// Start server
async function startServer() {
  // Vite middleware setup matching development mode rules
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware integrated for hot-reloads.");
  } else {
    // Serve build directory in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Electro Book Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
